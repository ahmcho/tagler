export enum AllowedMimeTypes {
    Png = 'image/png',
    Jpeg = 'image/jpeg',
    Gif = 'image/gif',
    Bmp = 'image/bmp',
    Webp = 'image/webp',
    Zip = 'application/zip',
    Pdf = 'application/pdf',
}
export enum DateFormatVariantEnum {
    DayMonthYearDot = 'd.m.Y',
    YearMonthDayDash = 'Y-m-d',
    DayMonthYearSlash = 'd/m/Y',
    MonthDayYearSlash = 'm/d/Y',
}
export enum DateTimeFormatVariantEnum {
    DayMonthYearDotTimeWithSeconds = 'd.m.Y H:i:s',
    DayMonthYearDotTime = 'd.m.Y H:i',
    YearMonthDayDashTimeWithSeconds = 'Y-m-d H:i:s',
    DayMonthYearSlashTime = 'd/m/Y H:i',
}
export enum InputValueTypeEnum {
    String = 0,
    Integer = 1,
    Boolean = 2,
    Json = 3,
    File = 4,
}
export enum ModelStatusEnum {
    Inactive = 0,
    Active = 1,
}
export enum PageStatus {
    Draft = 'draft',
    Published = 'published',
    Scheduled = 'scheduled',
}
export enum SettingInputEnum {
    Text = 'text',
    File = 'file',
    Select = 'select',
}
export enum SettingKeyEnum {
    AppName = 'app_name',
    Favicon = 'favicon',
    DateFormat = 'date_format',
    DateTimeFormat = 'datetime_format',
}
export enum TranslationGroupEnum {
    Auth = 'auth',
    Pagination = 'pagination',
    Passwords = 'passwords',
    Validation = 'validation',
    Translations = 'translations',
}
