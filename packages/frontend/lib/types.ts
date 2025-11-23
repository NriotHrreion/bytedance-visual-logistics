export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
export type SetItem<T> = T extends Set<infer U> ? U : never;
