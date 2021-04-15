export const boot: Boot = (...stages: Stage<any, any>[]) => (mode?: string) => {
    const processStage = async (
        context: any,
        remainingStages: Stage<any, any>[],
    ): Promise<any> => {
        if (remainingStages.length) {
            const stage = remainingStages[0];
            try {
                console.info(`⏳ ️${stage.name}`);
                console.info(`   ${stage.description}`);
                const stageResult = await stage.fn(context, mode);
                console.info(`✅  ${stage.name}`);
                return processStage(
                    {
                        ...context,
                        ...stageResult,
                    },
                    remainingStages.slice(1),
                );
            } catch (error) {
                console.error(`   ${error.message}`);
                console.error(`❌  ${stage.name}`);
                throw error;
            }
        }
        return context;
    };
    return processStage({}, stages).catch(() => process.exit(1));
};

export interface Boot {
    <T1>(stage1: Stage<{}, T1>): (mode?: string) => Promise<T1>;

    <T1, T2>(stage1: Stage<{}, T1>, stage2: Stage<T1, T2>): (
        mode?: string,
    ) => Promise<T1 & T2>;

    <T1, T2, T3>(
        stage1: Stage<{}, T1>,
        stage2: Stage<T1, T2>,
        stage3: Stage<T1 & T2, T3>,
    ): (mode?: string) => Promise<T1 & T2 & T3>;

    <T1, T2, T3, T4>(
        stage1: Stage<{}, T1>,
        stage2: Stage<T1, T2>,
        stage3: Stage<T1 & T2, T3>,
        stage4: Stage<T1 & T2 & T3, T4>,
    ): (mode?: string) => Promise<T1 & T2 & T3 & T4>;

    <T1, T2, T3, T4, T5>(
        stage1: Stage<{}, T1>,
        stage2: Stage<T1, T2>,
        stage3: Stage<T1 & T2, T3>,
        stage4: Stage<T1 & T2 & T3, T4>,
        stage5: Stage<T1 & T2 & T3 & T4, T5>,
    ): (mode: string) => Promise<T1 & T2 & T3 & T4 & T5>;

    <T1, T2, T3, T4, T5, T6>(
        stage1: Stage<{}, T1>,
        stage2: Stage<T1, T2>,
        stage3: Stage<T1 & T2, T3>,
        stage4: Stage<T1 & T2 & T3, T4>,
        stage5: Stage<T1 & T2 & T3 & T4, T5>,
        stage6: Stage<T1 & T2 & T3 & T4 & T5, T6>,
    ): (mode?: string) => Promise<T1 & T2 & T3 & T4 & T5 & T6>;

    <T1, T2, T3, T4, T5, T6, T7>(
        stage1: Stage<{}, T1>,
        stage2: Stage<T1, T2>,
        stage3: Stage<T1 & T2, T3>,
        stage4: Stage<T1 & T2 & T3, T4>,
        stage5: Stage<T1 & T2 & T3 & T4, T5>,
        stage6: Stage<T1 & T2 & T3 & T4 & T5, T6>,
        stage7: Stage<T1 & T2 & T3 & T4 & T5 & T6, T7>,
    ): (mode?: string) => Promise<T1 & T2 & T3 & T4 & T5 & T6>;

    <T1, T2, T3, T4, T5, T6, T7, T8>(
        stage1: Stage<{}, T1>,
        stage2: Stage<T1, T2>,
        stage3: Stage<T1 & T2, T3>,
        stage4: Stage<T1 & T2 & T3, T4>,
        stage5: Stage<T1 & T2 & T3 & T4, T5>,
        stage6: Stage<T1 & T2 & T3 & T4 & T5, T6>,
        stage7: Stage<T1 & T2 & T3 & T4 & T5 & T6, T7>,
        stage8: Stage<T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    ): (mode?: string) => Promise<T1 & T2 & T3 & T4 & T5 & T6>;

    <T1, T2, T3, T4, T5, T6, T7, T8, T9>(
        stage1: Stage<{}, T1>,
        stage2: Stage<T1, T2>,
        stage3: Stage<T1 & T2, T3>,
        stage4: Stage<T1 & T2 & T3, T4>,
        stage5: Stage<T1 & T2 & T3 & T4, T5>,
        stage6: Stage<T1 & T2 & T3 & T4 & T5, T6>,
        stage7: Stage<T1 & T2 & T3 & T4 & T5 & T6, T7>,
        stage8: Stage<T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
        stage9: Stage<T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>,
    ): (mode?: string) => Promise<T1 & T2 & T3 & T4 & T5 & T6>;

    <T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
        stage1: Stage<{}, T1>,
        stage2: Stage<T1, T2>,
        stage3: Stage<T1 & T2, T3>,
        stage4: Stage<T1 & T2 & T3, T4>,
        stage5: Stage<T1 & T2 & T3 & T4, T5>,
        stage6: Stage<T1 & T2 & T3 & T4 & T5, T6>,
        stage7: Stage<T1 & T2 & T3 & T4 & T5 & T6, T7>,
        stage8: Stage<T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
        stage9: Stage<T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>,
        stage10: Stage<T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9, T10>,
    ): (mode?: string) => Promise<T1 & T2 & T3 & T4 & T5 & T6>;
}

export type Stage<Args, Result> = {
    name: string;
    description: string;
    fn: (context: Args, mode?: string) => Promise<Result> | Result;
};

export class BootError extends Error {}
