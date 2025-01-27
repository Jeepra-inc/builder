declare const require: {
  context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp
  ): {
    keys(): string[];
    resolve(id: string): string;
    id: string;
    (id: string): any;
  } & ((id: string) => any);
};
