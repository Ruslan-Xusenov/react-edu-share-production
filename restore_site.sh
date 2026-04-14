#!/bin/bash
set -e

# EduShare Restoration Script
# Run this script with sudo: sudo ./restore_site.sh

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "========================================="
echo "  Restoring EduShare Services"
echo "========================================="

# 1. Fix PostgreSQL
echo "1. Restarting PostgreSQL..."
systemctl restart postgresql
sleep 2

# Check if postgres is listening
if ! ss -ntlp | grep -q 5432; then
    echo -e "${RED}✗ PostgreSQL failed to start or is not listening on 5432${NC}"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL is active${NC}"

# 2. Run Deployment Script
echo ""
echo "2. Running main deployment script..."
chmod +x deploy.sh
./deploy.sh

# 3. Final Service Verification
echo ""
echo "3. Verifying services..."
systemctl status edushare --no-pager || echo -e "${RED}⚠ Edushare service might need manual check${NC}"
systemctl status nginx --no-pager || echo -e "${RED}⚠ Nginx service might need manual check${NC}"

echo ""
echo "========================================="
echo -e "${GREEN}  Restoration Complete!${NC}"
echo "========================================="
echo "Check your site at https://edushare.uz"
