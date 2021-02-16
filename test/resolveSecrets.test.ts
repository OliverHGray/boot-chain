import { resolveSecrets } from '../src/resolveSecrets';

test('works', async () => {
    const { config } = await resolveSecrets(
        {
            NOT_A_SECRET: 'hello',
            A_SECRET: 'SECRET_PROVIDER<secret.id.example.com>',
        },
        {
            prefix: 'SECRET_PROVIDER',
            getSecret: (id) => {
                if (id === 'secret.id.example.com') {
                    return 'a secret value';
                }
                return null;
            },
        },
    ).fn();

    expect(config).toEqual({
        NOT_A_SECRET: 'hello',
        A_SECRET: 'a secret value',
    });
});

test('errors on missing secret', async () => {
    const promise = resolveSecrets(
        {
            NOT_A_SECRET: 'hello',
            A_SECRET: 'SECRET_PROVIDER<secret.id.example.com>',
        },
        {
            prefix: 'SECRET_PROVIDER',
            getSecret: () => {
                return null;
            },
        },
    ).fn();

    await expect(promise).rejects.toThrowError(
        'The following secrets were missing: A_SECRET.',
    );
});
