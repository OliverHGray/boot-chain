import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { BootError } from './';

const SECRET_REGEX = /^SECRET_MANAGER<(.*)>$/;

export const resolveSecrets = () => ({
    name: 'Secret Manager',
    description: 'Resolving secrets',
    fn: async ({ config }: { config: Config }): Promise<{ config: Config }> => {
        const secrets = await Promise.all(
            Object.entries(config).map(getSecret()),
        );
        const missingSecrets = secrets.filter(([, value]) => !value);
        if (missingSecrets.length > 0) {
            throw new BootError(
                `The following secrets were missing: ${missingSecrets.join(
                    ', ',
                )}.`,
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

const getSecret = () => {
    const client = new SecretManagerServiceClient();
    return async ([key, value]: string[]) => {
        try {
            const [, name] = value.match(SECRET_REGEX) || [];
            if (!name) {
                return [key, value] as const;
            }
            console.log(`   Resolving secret value for '${key}'.`);
            const [version] = await client.accessSecretVersion({
                name,
            });
            return [key, version?.payload?.data?.toString()] as const;
        } catch (error) {
            error.message = `Error fetching secret '${key}': '${error.message}'`;
            throw error;
        }
    };
};

export type Config = Record<string, string>;
