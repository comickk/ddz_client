// 包涵了一些节点处理公用的操作
var DECK_TYPE = require('Enum').DECK_TYPE;
var ObserverMgr = require('ObserverMgr');
module.exports = {
    addPutCardDescEffect(cardType, effectPrefab, effectParentNode, userID){
        if (cardType == DECK_TYPE.CONTINUE ||
            cardType == DECK_TYPE.DB_CONTINUE ||
            cardType == DECK_TYPE.TB_CONTINUE ||
            cardType == DECK_TYPE.FOUR_TWO ||
            cardType == DECK_TYPE.FOUR_TWO4 ||
            cardType == DECK_TYPE.AIRPLANE_1 ||
            cardType == DECK_TYPE.AIRPLANE_2 ||
            cardType == DECK_TYPE.AIRPLANE_3 ||
            cardType == DECK_TYPE.AIRPLANE_4 ||
            cardType == DECK_TYPE.AIRPLANE_5 ||
            cardType == DECK_TYPE.AIRPLANE_6 ||
            cardType == DECK_TYPE.AIRPLANE_7
        ) {
            var node = cc.instantiate(effectPrefab);
            var script = node.getComponent("CardTypeEffects");
            if (script) {
                script.playCardEffect(cardType, userID);
            }
            effectParentNode.addChild(node);
        } else if (cardType == DECK_TYPE.BOMB) {
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerBomb, userID);
        } else if (cardType == DECK_TYPE.ROCKET) {
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerRocket, userID);
        }

    },

    // spine角色出牌
    onRolePushCardAni(spineAni){
        if (spineAni) {
            spineAni.setAnimation(0, 'chupai', false);
            spineAni.addAnimation(0, 'daiji', true, 0.5);
        }
    },
    //spine角色思考出牌
    onRoleThinkAni(spineAni){
        if (spineAni) {
            spineAni.setAnimation(0, 'sikao', true);
        }
    },
    // spine 角色待机
    onRoleIdleAni(spineAni){
        if (spineAni) {
            spineAni.setAnimation(0, 'daiji', true);
        }
    },
    // spine角色抢地主
    onRoleRobLandlord(spineAni){
        if (spineAni) {
            spineAni.setAnimation(0, 'robLord', false);
            spineAni.addAnimation(0, 'daiji', true, 0.8);
        }
    },
    // spine 角色获取到牌
    onRoleGetCard(spineAni){
        if (spineAni) {
            spineAni.setAnimation(0, 'pushCard', true);
        }
    },
};