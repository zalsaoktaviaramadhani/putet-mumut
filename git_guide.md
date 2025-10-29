# Git Push Guide

1. Initialize Git repository (if not already done):
```
git init
```

2. Add all files to staging:
```
git add .
```

3. Commit your changes:
```
git commit -m "Your commit message here"
```

4. Add remote repository (if not already done):
```
git remote add origin your-repository-url
```

5. Push your changes:
```
git push -u origin main
```

Note: 
- Replace `your-repository-url` with your actual GitHub repository URL
- If you're using a different branch name than `main`, replace it accordingly
- Use `git status` to check the status of your files
