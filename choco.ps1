$chocoPath = "C:\Softwares\apache-maven-3.9.12-bin\apache-maven-3.9.12\bin"
$machinePath = [Environment]::GetEnvironmentVariable("Path","Machine")

if ($machinePath -notlike "*$chocoPath*") {
    [Environment]::SetEnvironmentVariable(
        "Path",
        "$machinePath;$chocoPath",
        "Machine"
    )
}
