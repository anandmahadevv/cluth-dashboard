# Run locally. The password is not echoed or written to a file; only its SHA-256 hash is printed.
$password = Read-Host 'Enter the Super Admin password to configure' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
try {
  $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  $bytes = [Text.Encoding]::UTF8.GetBytes($plain)
  $sha = [Security.Cryptography.SHA256]::Create()
  try { ($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString('x2') }) -join '' }
  finally { $sha.Dispose(); [Array]::Clear($bytes, 0, $bytes.Length); $plain = $null }
} finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer); $password.Dispose() }
