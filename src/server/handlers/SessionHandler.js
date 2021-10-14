import ShopifySession from '@shopify/shopify-api/dist/auth/session';
import db from "../database"

let temporarySessions = {};
const myShopify = ".myshopify.com";

class SessionHandler {
    
    async storeSession(session) {
        try {
            if(!session.id.includes(myShopify)) {
                temporarySessions[session.id] = session;
                return session;
            }
    
            await db.Shop.upsert({
                ShopDomain: session.shop
            });

            let storedSession = await db.Session.upsert({
                Id: session.id,
                ShopDomain: session.shop,
                State: session.state,
                Scope: session.scope,
                IsOnline: session.isOnline,
                AccessToken: session.accessToken,
                Expires: session.expires ? session.expires : null,
                OnlineAccessInfo: session.onlineAccessInfo ? JSON.stringify(session.onlineAccessInfo) : null
            });
            return storedSession ? session : undefined;

        } catch (error) {
            console.error(error);
        }
        return undefined;
    }

    async loadSession(id) {
        try {
            if(!id.includes(myShopify) && temporarySessions.hasOwnProperty(id)) {
                return temporarySessions[id];
            }

            const dbSession = await db.Session.findOne({
                where: { Id: id } 
            });
            if(dbSession) {
                let tempSessions = JSON.parse(JSON.stringify(temporarySessions));
                for (const [key, value] of Object.entries(tempSessions)) {
                    if(value.shop === dbSession.ShopDomain) {
                        delete temporarySessions[key];
                    }
                }

                let storedSession = new ShopifySession.Session(dbSession.Id);
                storedSession.shop = dbSession.ShopDomain;
                storedSession.state = dbSession.State;
                storedSession.scope = dbSession.Scope;
                storedSession.isOnline = dbSession.IsOnline;
                storedSession.accessToken = dbSession.AccessToken;
                storedSession.expires =  dbSession.Expires ? new Date(dbSession.Expires) : null;
                storedSession.onlineAccessInfo = dbSession.OnlineAccessInfo ? JSON.parse(dbSession.OnlineAccessInfo) : null;
                return storedSession;
            }

            return undefined;
        } catch (error) {
            console.error(error);
        }
        return undefined;

    }

    async deleteSession(id) {

        try {
            if(!id.includes(myShopify) && temporarySessions.hasOwnProperty(id)) {
                delete temporarySessions[id]
                return true;
            }

            let result = await db.Session.destroy({ where: { Id: id } });
            return result > 0;
        } catch (error) {
            console.error(error);
        }
        return false;
    }
}

module.exports = SessionHandler;