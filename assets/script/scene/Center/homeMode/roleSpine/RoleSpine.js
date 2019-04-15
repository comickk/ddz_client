cc.Class({
    extends: cc.Component,

    properties: {
        spine: {default: null, displayName: "Spine", type: sp.Skeleton},
        _state: 0,
    },

    onLoad: function () {

    },
    onPushCard(){
        this._state = Poker.RoleState.PushCard;
    },
    onThink(){

    },
    onRobLandlord(){

    },
    onGetCard(){

    },
});
