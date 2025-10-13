type IResultType = "SUCCESS" | "ERROR" | "WARNING" | "FAILED";

type ResultObject<T = any, M = Record<string, any>> = {
  resultType: IResultType;
  resultMessage?: string;
  dataContent?: T;
  metaData: M & {
    version: string;
    redis?: boolean;
    [key: string]: any;
  };
};
