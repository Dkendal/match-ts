export declare function valueof<T>(): T

export type Result<T> = Success<T> | Failure
export type Success<T> = { type: 'ok'; value: T }
export type Failure = { type: 'error'; error: Error }
export type Text = { type: 'text'; content: string }
export type Img = { type: 'img'; src: string }
export type Data = Text | Img
