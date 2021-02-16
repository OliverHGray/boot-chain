import { BootError } from './';

export const resolveSecrets = (
    config: Config,
    ...secretProviders: SecretProvider[]
) => ({
    name: 'Secret resolver',
    description: `Resolving secrets with the following prefixes: ${secretProviders
        .map(({ prefix }) => prefix)
        .join(', ')}`,
    fn: async (): Promise<{ config: Config }> => {
        const providersRegex = secretProviders.map(({ prefix, getSecret }) => ({
            pattern: new RegExp(`^${prefix}<(.*)>$`),
            getSecret,
        }));
        const secrets = await Promise.all(
            Object.entries(config)
                .filter(([, value]) => value)
                .map(async ([key, value]) => {
                    const provider = providersRegex
                        .map(({ pattern, getSecret }) => {
                            const [, identifier] =
                                (value as string).match(pattern) || [];
                            return {
                                identifier,
                                getSecret,
                            };
                        })
                        .find(({ identifier }) => identifier);
                    if (!provider) {
                        return [key, value] as const;
                    }
                    try {
                        return [
                            key,
                            await provider.getSecret(provider.identifier, key),
                        ] as const;
                    } catch (error) {
                        throw new BootError(
                            `Error fetching secret '${key}': '${error.message}'`,
                        );
                    }
                }),
        );
        const missingSecrets = secrets.filter(([, value]) => !value);
        if (missingSecrets.length > 0) {
            throw new BootError(
                `The following secrets were missing: ${missingSecrets
                    .map(([key]) => key)
                    .join(', ')}.`,
            );
        }
        return {
            config: secrets.reduce(
                (config, [key, value]) => ({
                    ...config,
                    [key]: value,
                }),
                {},
            ),
        };
    },
});

export type SecretProvider = {
    prefix: string;
    getSecret: (
        identifier: string,
        key: string,
    ) => SecretValue | Promise<SecretValue>;
};

export type Config = Record<string, SecretValue>;

export type SecretValue = string | null | undefined;
