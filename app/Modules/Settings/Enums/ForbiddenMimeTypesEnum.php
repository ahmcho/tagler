<?php

namespace App\Modules\Settings\Enums;

enum ForbiddenMimeTypesEnum: string
{
    case Php = 'application/x-httpd-php';
    case ServerHtml = 'text/html';
    case HtAccess = 'text/x-apache-config';
    case WindowsExecutable = 'application/x-msdownload';
    case WindowsInstaller = 'application/x-msi';
    case BatchScript = 'application/x-bat';
    case WindowsShortcut = 'application/x-ms-shortcut';
    case RegistryFile = 'text/x-ms-regedit';
    case ShellScript = 'application/x-sh';
    case PowerShellScript = 'application/x-powershell';
    case VbScript = 'text/vbscript';
    case JavaScript = 'text/javascript';
    case WindowsScriptHost = 'application/x-wsh';
    case HtaApplication = 'application/hta';
    case CgiScript = 'application/x-cgi';
    case PerlScript = 'application/x-perl';
    case PythonScript = 'text/x-python';
    case RubyScript = 'application/x-ruby';
    case AspPage = 'application/x-asp';
    case JavaServerPage = 'application/x-jsp';
    case JavaClass = 'application/java-vm';
    case JavaArchive = 'application/java-archive';
    case AndroidPackage = 'application/vnd.android.package-archive';
    case SharedLibrary = 'application/x-sharedlib';
    case MachOBinary = 'application/x-mach-binary';

    /**
     * Returns the main file extension (without the dot) for this MIME type.
     */
    public function extension(): string
    {
        return match ($this) {
            self::Php => 'php',
            self::ServerHtml => 'html',
            self::HtAccess => 'htaccess',
            self::WindowsExecutable => 'exe',
            self::WindowsInstaller => 'msi',
            self::BatchScript => 'bat',
            self::WindowsShortcut => 'lnk',
            self::RegistryFile => 'reg',
            self::ShellScript => 'sh',
            self::PowerShellScript => 'ps1',
            self::VbScript => 'vbs',
            self::JavaScript => 'js',
            self::WindowsScriptHost => 'wsf',
            self::HtaApplication => 'hta',
            self::CgiScript => 'cgi',
            self::PerlScript => 'pl',
            self::PythonScript => 'py',
            self::RubyScript => 'rb',
            self::AspPage => 'asp',
            self::JavaServerPage => 'jsp',
            self::JavaClass => 'class',
            self::JavaArchive => 'jar',
            self::AndroidPackage => 'apk',
            self::SharedLibrary => 'so',
            self::MachOBinary => 'dylib',
        };
    }

    /**
     * Returns the other extensions that use this MIME type, without the dot.
     *
     * @return array<int, string>
     */
    public function aliases(): array
    {
        return match ($this) {
            self::Php => ['phtml', 'phar', 'pht', 'phps', 'pgif', 'phtm', 'inc'],
            self::ServerHtml => ['htm', 'xhtml', 'shtml'],
            self::HtAccess => ['htpasswd'],
            self::WindowsExecutable => ['dll', 'com', 'scr', 'pif', 'cpl'],
            self::WindowsInstaller => ['msp'],
            self::BatchScript => ['cmd'],
            self::ShellScript => ['bash', 'zsh'],
            self::PowerShellScript => ['psm1'],
            self::VbScript => ['vbe'],
            self::JavaScript => ['jse'],
            self::WindowsScriptHost => ['wsh'],
            self::AspPage => ['aspx'],
            self::JavaServerPage => ['jspx'],
            default => [],
        };
    }

    /**
     * Every forbidden extension, main and alias, without dots.
     *
     * @return array<int, string>
     */
    public static function extensions(): array
    {
        return array_merge(
            ...array_map(fn (self $case): array => [$case->extension(), ...$case->aliases()], self::cases()),
        );
    }
}
