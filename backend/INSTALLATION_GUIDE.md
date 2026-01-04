# Installing @bidyashish/panchang on Windows

## The Issue
The `@bidyashish/panchang` package depends on `swisseph` (Swiss Ephemeris), which is a native C++ module that needs to be compiled during installation.

## Solution: Install Windows Build Tools

### Option 1: Install Visual Studio Build Tools (Recommended)

1. Download and install Visual Studio Build Tools from:
   https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

2. During installation, select:
   - "Desktop development with C++"
   - Make sure "MSVC v143 - VS 2022 C++ x64/x86 build tools" is checked
   - Make sure "Windows 10/11 SDK" is checked

3. After installation, open a **NEW** PowerShell window as Administrator and run:
   ```powershell
   npm install @bidyashish/panchang
   ```

### Option 2: Quick Install with Chocolatey

If you have Chocolatey installed:

```powershell
# Run PowerShell as Administrator
choco install visualstudio2022buildtools --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

### Option 3: Use windows-build-tools (Legacy)

```powershell
# Run PowerShell as Administrator
npm install --global windows-build-tools
```

**Note:** This option is deprecated but might still work.

## After Installing Build Tools

1. Close all terminal windows
2. Open a NEW terminal (PowerShell or CMD)
3. Navigate to your project:
   ```powershell
   cd d:\4.own\Projects\panchBotTele\backend
   ```
4. Install the package:
   ```powershell
   npm install @bidyashish/panchang
   ```

## Verify Installation

Once installed, test it with:

```powershell
node test-panchang.js
```

## Alternative: Use Docker

If you don't want to install build tools locally, you can use Docker:

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

## Troubleshooting

### If npm install still fails:

1. Check Python is installed (node-gyp needs Python 3.x):
   ```powershell
   python --version
   ```

2. Set Python path explicitly:
   ```powershell
   npm config set python "C:\Path\To\Python\python.exe"
   ```

3. Check Node.js version (requires 16+):
   ```powershell
   node --version
   ```

4. Try with --build-from-source flag:
   ```powershell
   npm install @bidyashish/panchang --build-from-source
   ```

5. Clear npm cache and try again:
   ```powershell
   npm cache clean --force
   npm install @bidyashish/panchang
   ```

## Current Status

- ✅ Node.js version: v22.15.1 (compatible)
- ✅ npm version: 10.9.2
- ❌ C++ Build Tools: NOT INSTALLED
- ❌ @bidyashish/panchang: NOT INSTALLED

## Next Steps

1. Install Visual Studio Build Tools (Option 1 above)
2. Open a NEW terminal
3. Run: `npm install @bidyashish/panchang`
4. Test with: `node test-panchang.js`
