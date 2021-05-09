// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

enum PlayerStatus {
    Breathing,
    Falling,
    Falled,
    MoveLeft,
    MoveRight,
}

@ccclass
export default class PlayerControllerClass extends cc.Component {

    // @property(cc.Label)
    // label: cc.Label = null;

    // @property
    // text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    @property({type:cc.Enum(PlayerStatus)})
    uiStatus: PlayerStatus = PlayerStatus.Breathing;

    private _statusChange = false;
    private _prevStatus: PlayerStatus = PlayerStatus.Breathing;

    start () {
        // cc.log('started')
        // cc.log(this.uiStatus)
        // cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this)
    }

    // for test
    onKeyDown(event: any) {
        // cc.log('onKeyDown')
        // cc.log(this.uiStatus)
        let nextStatus: PlayerStatus = null;
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                nextStatus = PlayerStatus.Breathing;
                break;
            case cc.macro.KEY.s:
                nextStatus = PlayerStatus.Falling;
                break;
            case cc.macro.KEY.d:
                nextStatus = PlayerStatus.Falled;
                break;
            case cc.macro.KEY.f:
                nextStatus = PlayerStatus.MoveLeft;
                break;
            case cc.macro.KEY.g:
                nextStatus = PlayerStatus.MoveRight;
                break;
            default:
                break;
        }
        if (nextStatus !== null && nextStatus !== this.uiStatus) {
            this._statusChange = true;
            this.uiStatus = nextStatus;
        }
    }

    // update (dt) {}
    update (deltaTime: number) {
        // if (this._statusChange) {
        if (this._prevStatus !== this.uiStatus) {
            cc.log('status changed')
            const anim = this.getComponent(cc.Animation);
            switch (this.uiStatus) {
                case PlayerStatus.Breathing:
                    anim.play('breath');
                    break;
                case PlayerStatus.Falling:
                    anim.play('falling');
                    break;
                case PlayerStatus.Falled:
                    anim.play('falled');
                    break;
                case PlayerStatus.MoveLeft:
                    anim.play('moveLeft');
                    break;
                case PlayerStatus.MoveRight:
                    anim.play('moveRight');
                    break;
            
                default:
                    break;
            }
            // this._statusChange = false;
            this._prevStatus = this.uiStatus;
        }
    }
}
