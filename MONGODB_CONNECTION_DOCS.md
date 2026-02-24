# MongoDB Atlas Connection Documentation Links

## 🔗 Essential Documentation Links

### 1. **Getting Standard (Non-SRV) Connection String**
**Primary Guide:** https://www.mongodb.com/docs/atlas/connect-to-database-deployment/

**Key Steps:**
- Go to MongoDB Atlas → Your Cluster → **Connect** button
- Click **"Connect your application"**
- Select **"Standard connection string"** (NOT "SRV connection string")
- Copy the connection string and replace `<password>` with your actual password

**Direct Link:** https://www.mongodb.com/docs/atlas/connect-to-database-deployment/#connect-to-your-cloud-cluster

---

### 2. **Connection String Formats & Reference**
**Full Reference:** https://www.mongodb.com/docs/manual/reference/connection-string/

**Key Information:**
- Standard format: `mongodb://username:password@host1:port1,host2:port2/?options`
- SRV format: `mongodb+srv://username:password@cluster.mongodb.net/?options`
- Connection string options and parameters

**Direct Link:** https://www.mongodb.com/docs/manual/reference/connection-string/

---

### 3. **Troubleshooting Connection Issues**
**Complete Troubleshooting Guide:** https://www.mongodb.com/docs/atlas/troubleshoot-connection/

**Common Issues Covered:**
- ✅ **IP Access List** - Your IP must be whitelisted
- ✅ **Authentication Failed** - Database user credentials
- ✅ **Too Many Connections** - Connection pool limits
- ✅ **Firewall Issues** - Port 27017 must be open
- ✅ **SRV DNS Issues** - `querySrv ECONNREFUSED` errors
- ✅ **Special Characters in Password** - URL encoding required

**Direct Link:** https://www.mongodb.com/docs/atlas/troubleshoot-connection/

---

## 🔧 Specific Solutions for Your Error

### Error: `querySrv ECONNREFUSED _mongodb._tcp.cluster0.rb9ozl8.mongodb.net`

**Solution:** Use Standard Connection String instead of SRV

**Documentation Section:** 
- https://www.mongodb.com/docs/atlas/troubleshoot-connection/#connection-refused-using-srv-connection-string

**Steps:**
1. Get standard connection string from Atlas UI (see link #1 above)
2. Replace `mongodb+srv://` with `mongodb://` format
3. Use the exact hostnames and ports provided by Atlas

---

### Error: "Could not connect to any servers in your MongoDB Atlas cluster"

**Possible Causes:**
1. **IP Not Whitelisted** - Most common issue
2. **Incorrect Connection String** - Wrong hostnames/ports
3. **Authentication Failed** - Wrong username/password

**Documentation:**
- IP Access List: https://www.mongodb.com/docs/atlas/security/ip-access-list/
- Database Users: https://www.mongodb.com/docs/atlas/security-add-mongodb-users/

**Quick Fix:**
1. Go to Atlas → **Network Access** → Add your current IP (or `0.0.0.0/0` for testing)
2. Verify database user exists: Atlas → **Database Access**
3. Double-check connection string format

---

## 📚 Additional Helpful Links

### Network & Security
- **IP Access List Management:** https://www.mongodb.com/docs/atlas/security/ip-access-list/
- **Database User Management:** https://www.mongodb.com/docs/atlas/security-add-mongodb-users/
- **Connection Limits:** https://www.mongodb.com/docs/atlas/reference/atlas-limits/#connection-limits

### Connection Methods
- **Connect via Node.js Driver:** https://www.mongodb.com/docs/atlas/driver-connection/
- **Connect via MongoDB Shell:** https://www.mongodb.com/docs/atlas/mongo-shell-connection/
- **Connect via Compass:** https://www.mongodb.com/docs/atlas/compass-connection/

### Connection String Options
- **All Available Options:** https://www.mongodb.com/docs/manual/reference/connection-string-options/
- **Connection Pool Settings:** https://www.mongodb.com/docs/manual/reference/connection-string-options/#connection-pool-options

---

## 🎯 Quick Action Items

1. **Get Standard Connection String:**
   - Atlas → Cluster → Connect → "Connect your application" → "Standard connection string"
   - Copy and replace `<password>` with: `7qGt7hXRynVrM1IM`

2. **Check IP Whitelist:**
   - Atlas → Network Access → Add your IP or `0.0.0.0/0` (for testing)

3. **Verify Database User:**
   - Atlas → Database Access → Ensure `chymukund338_db_user` exists

4. **Test Connection:**
   - Use the standard connection string format: `mongodb://...`
   - Should NOT use `mongodb+srv://` if DNS SRV lookups are blocked

---

## 💡 Pro Tips

- **Standard connection strings** work better when DNS SRV is blocked
- **Always URL-encode** special characters in passwords: `@` → `%40`, `:` → `%3A`, etc.
- **Use connection pooling** with `maxPoolSize` option to limit connections
- **Test connection** before deploying to production

---

## 🆘 Still Having Issues?

1. Check the troubleshooting guide: https://www.mongodb.com/docs/atlas/troubleshoot-connection/
2. Verify your connection string format matches examples
3. Test network connectivity to port 27017
4. Check MongoDB Community Forums: https://www.mongodb.com/community/forums/
