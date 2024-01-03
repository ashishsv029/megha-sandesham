declare type Config = {
    appServerPort: number;
    redis: {
        connectionString: string
    };
    //something: number
}

declare type Dependencies = {
    [key: string]: any
}