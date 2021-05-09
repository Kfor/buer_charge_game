// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import PlayerController from "./PlayerController";

enum PlayerStatus {
    Breathing,
    Falling,
    Falled,
    MoveLeft,
    MoveRight,
}

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    player: cc.Node;

    @property({type: PlayerController})
    public playerCtrl: PlayerController = null;
    
    @property(cc.Node)
    canvas: cc.Node;

    @property(Number)
    playerSpeed: number = 200;

    // LIFE-CYCLE CALLBACKS:

    private _canvasWidth = 0;
    private _isTouching = false;
    private _touchPos = new cc.Vec2();
    

    // onLoad () {}

    start () {
        this.eventRegister()
        this.dataInit()
        this.generatePlatform()
    }

    eventRegister() {
        // cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onKeyDown, this)
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this)
        this.canvas.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
    }

    dataInit() {
        this._canvasWidth = this.canvas?.getContentSize().width
        this.player.setPosition(0, this.canvas?.getContentSize().height/4)
    }

    generatePlatform() {
        
    }

    onTouchStart(event: cc.Event.EventTouch) {
        cc.log('onTouchStart')
        this._isTouching = true;
        const location: any = event.getTouches()[0].getLocation()
        this._touchPos.x = location.x
        this._touchPos.y = location.y
    }

    onTouchMove(event: cc.Event.EventTouch) {
        cc.log('onTouchMove')
        this._isTouching = true;
        const location: any = event.getTouches()[0].getLocation()
        this._touchPos.x = location.x
        this._touchPos.y = location.y
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        cc.log('onTouchEnd')
        this._isTouching = false;
        // const location: any = event.getTouches()[0].getLocation()
        // this._touchPos.x, this._touchPos.y = location.x, location.y
    }

    onKeyDown(event: any) {
        let newPos = new cc.Vec2()
        const speed = 40
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                cc.Vec2.add(newPos, this.player.getPosition(), new cc.Vec2(-speed, 0.0))
                this.player.setPosition(newPos)
                break;
            case cc.macro.KEY.w:
                cc.Vec2.add(newPos, this.player.getPosition(), new cc.Vec2(0.0, speed))
                this.player.setPosition(newPos)
                break;
            case cc.macro.KEY.s:
                cc.Vec2.add(newPos, this.player.getPosition(), new cc.Vec2(0.0, -speed))
                this.player.setPosition(newPos)
                break;
            case cc.macro.KEY.d:
                cc.Vec2.add(newPos, this.player.getPosition(), new cc.Vec2(speed, 0.0))
                this.player.setPosition(newPos)
                break;
            default:
                break;
        }
    }

    // update (dt) {}
    update (deltaTime: number) {
        if (this._isTouching) {
            let newPos = new cc.Vec2()
            if (this._touchPos.x > this._canvasWidth/2) {
                cc.Vec2.add(newPos, this.player.getPosition(), new cc.Vec2(this.playerSpeed * deltaTime, 0))
                this.playerCtrl.uiStatus = PlayerStatus.MoveLeft
            } else {
                cc.Vec2.add(newPos, this.player.getPosition(), new cc.Vec2(-this.playerSpeed * deltaTime, 0))
                this.playerCtrl.uiStatus = PlayerStatus.MoveRight
            }
            this.player.setPosition(newPos)
        } else {
            this.playerCtrl.uiStatus = PlayerStatus.Breathing
        }
    }
}
