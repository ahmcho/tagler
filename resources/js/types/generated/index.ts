export enum AllowedMimeTypesEnum {
    Jpeg = 'image/jpeg',
    Png = 'image/png',
    Webp = 'image/webp',
    Gif = 'image/gif',
    Mpeg4 = 'video/mp4',
    Webm = 'video/webm',
    Mov = 'video/quicktime',
    Mp3 = 'audio/mpeg',
    Wav = 'audio/wav',
    Ogg = 'audio/ogg',
    Bmp = 'image/bmp',
    Zip = 'application/zip',
    Pdf = 'application/pdf',
    PlainText = 'text/plain',
}
export enum BodyFormatEnum {
    Html = 'html',
    Markdown = 'markdown',
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
export enum ForbiddenMimeTypesEnum {
    Php = 'application/x-httpd-php',
    ServerHtml = 'text/html',
    HtAccess = 'text/x-apache-config',
    WindowsExecutable = 'application/x-msdownload',
    WindowsInstaller = 'application/x-msi',
    BatchScript = 'application/x-bat',
    WindowsShortcut = 'application/x-ms-shortcut',
    RegistryFile = 'text/x-ms-regedit',
    ShellScript = 'application/x-sh',
    PowerShellScript = 'application/x-powershell',
    VbScript = 'text/vbscript',
    JavaScript = 'text/javascript',
    WindowsScriptHost = 'application/x-wsh',
    HtaApplication = 'application/hta',
    CgiScript = 'application/x-cgi',
    PerlScript = 'application/x-perl',
    PythonScript = 'text/x-python',
    RubyScript = 'application/x-ruby',
    AspPage = 'application/x-asp',
    JavaServerPage = 'application/x-jsp',
    JavaClass = 'application/java-vm',
    JavaArchive = 'application/java-archive',
    AndroidPackage = 'application/vnd.android.package-archive',
    SharedLibrary = 'application/x-sharedlib',
    MachOBinary = 'application/x-mach-binary',
}
export enum InputValueTypeEnum {
    String = 0,
    Integer = 1,
    Boolean = 2,
    Json = 3,
    File = 4,
}
export enum LocaleEnum {
    Az = 'az',
    En = 'en',
    Ru = 'ru',
}
export enum MediaCategoryEnum {
    Pictures = 'pictures',
    Videos = 'videos',
    Audio = 'audio',
    Documents = 'documents',
    Other = 'other',
}
export enum MediaConversionEnum {
    Thumbnail = 'thumbnail',
    Medium = 'medium',
    Large = 'large',
}
export enum MediaProcessingStatusEnum {
    Pending = 'pending',
    Processing = 'processing',
    Ready = 'ready',
    Failed = 'failed',
}
export enum MediaVisibilityEnum {
    Public = 'public',
    Private = 'private',
}
export enum ModelStatusEnum {
    Inactive = 0,
    Active = 1,
}
export enum PageStatusEnum {
    Draft = 'draft',
    Published = 'published',
    Scheduled = 'scheduled',
}
export enum SettingInputEnum {
    Text = 'text',
    File = 'file',
    Select = 'select',
    Number = 'number',
}
export enum SettingKeyEnum {
    AppName = 'app_name',
    Favicon = 'favicon',
    DateFormat = 'date_format',
    DateTimeFormat = 'datetime_format',
    TimeFormat = 'time_format',
    MediaLinkTtlMinutes = 'media_link_ttl_minutes',
}
export enum TimeFormatVariantEnum {
    TwelveHour = 'h:i A',
    TwentyFourHour = 'H:i',
}
export enum TranslationGroupEnum {
    Auth = 'auth',
    Pagination = 'pagination',
    Passwords = 'passwords',
    Validation = 'validation',
    Translations = 'translations',
}
