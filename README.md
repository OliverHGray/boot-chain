# boot-chain

Smoothly handle a staged application boot process. Based on an additive pipe that adds properties to a context object if the stage completes.

## Example

The following is a full example showing how boot-chain is used

```typescript
import { name, version } from '../package.json';
import { boot as bootChain } from 'boot-chain';
import { resolveSecrets } from 'boot-chain/resolveSecrets';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { number, object, string } from 'yup';
import { connect } from 'mongoose';
import createApp from './app';

export const boot = bootChain(
    resolveSecrets(process.env, {
        prefix: 'SECRET_MANAGER',
        getSecret: (() => {
            const client = new SecretManagerServiceClient();
            return async (name: string) => {
                const [version] = await client.accessSecretVersion({
                    name,
                });
                return version?.payload?.data?.toString();
            };
        })(),
    }),

    {
        name: 'Validate Config',
        description: 'Validating configuration',
        fn: async ({ config }) => ({
            config: await object({
                MONGODB_URI: string().defined(),
                CONFIG_EXAMPLE: string().defined(),
                PORT: number().default(3000).defined(),
            })
                .defined()
                .validate(config, {
                    abortEarly: false,
                    stripUnknown: true,
                })
                .catch(({ errors }) => {
                    throw new Error(errors.join('\n   '));
                }),
        }),
    },

    {
        name: 'Mongo',
        description: 'Connecting to Mongo',
        fn: async ({ config }) => {
            return {
                mongoose: await connect(config.MONGODB_URI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useCreateIndex: true,
                }),
            };
        },
    },

    {
        name: 'Express',
        description: 'Creating application',
        fn: async ({ config }) => ({
            app: createApp({
                config: {
                    example: config.CONFIG_EXAMPLE,
                },
            }),
        }),
    },

    {
        name: 'Express',
        description: 'Starting application',
        fn: async ({ app, config }, mode) => {
            if (mode === 'production') {
                app.listen(config.PORT)
                    .on('error', (error) => {
                        console.error(error);
                    })
                    .on('listening', () => {
                        console.info(
                            `${name}@${version} listening on port ${config.PORT}`,
                        );
                    });
            }
        },
    },
);
```
