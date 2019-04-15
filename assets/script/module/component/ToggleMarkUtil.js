module.exports = {
    // 设置toggleMark下的子节点的active
    onToggle(toggle){
        if (toggle) {
            var toggleItemArr = toggle.toggleGroup._toggleItems;
            for (var i = 0; i < toggleItemArr.length; i++) {
                var item = toggleItemArr[i];
                if (toggle == item) {// 子节点设置为true
                    item.checkMark.enabled = true;
                    this._setMarkChildrenVisible(item, true);
                } else {
                    item.checkMark.enabled = false;
                    this._setMarkChildrenVisible(item, false);
                }
            }
        }
    },
    _setMarkChildrenVisible(toggle, b){
        var children = toggle.checkMark.node.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            child.active = b;
        }
    },
}
