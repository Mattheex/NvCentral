# NvCentral

### Build Docker

```bash
docker build -t ohzout/nvcentral:latest .
```

### Run Docker

```bash
docker run --name NvCentral -p 3000:3000 -p 5000:5000 -p 3030:3030 ohzout/nvcentral:latest
```
