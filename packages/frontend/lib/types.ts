export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
export type PromiseType<T> = T extends Promise<infer U> ? U : never;
export type ItemOfSet<T> = T extends Set<infer U> ? U : never;
