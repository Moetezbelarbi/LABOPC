# Bump de version + commit + push
./deploy.sh              # 1.0.0 → 1.0.1
./deploy.sh minor        # 1.0.0 → 1.1.0
./deploy.sh major "v2"   # 1.0.0 → 2.0.0
./deploy.sh --dry-run    # simulation