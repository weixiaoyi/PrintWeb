const appAuthority = require("@/core/base/AppAuthority");

module.exports = async () => {
    await appAuthority.loadAuthorityCert()
}
