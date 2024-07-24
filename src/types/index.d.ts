declare module "*.module.css"
{
    const content: Record<string, string>;
    export default content;
}
declare module "*.png"
{
    const value: string;
    export default value;
}
declare interface SQLiteError extends Error 
{
    errno: number,
    code: string,
}
declare let __webpack_require__:
{
    ab: string;
}