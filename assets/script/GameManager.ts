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
    canvas: cc.Node;

    @property(cc.Node)
    player: cc.Node;

    @property({type: PlayerController})
    public playerCtrl: PlayerController = null;

    @property(Number)
    playerSpeed: number = 400;
    
    @property({type: cc.Prefab})
    public basicPlatformPrfb: cc.Prefab = null;
    @property({type: cc.Prefab})
    public fallPlatformPrfb: cc.Prefab = null;
    @property({type: cc.Prefab})
    public hurtPlatformPrfb: cc.Prefab = null;
    @property({type: cc.Prefab})
    public travelLeftPlatformPrfb: cc.Prefab = null;
    @property({type: cc.Prefab})
    public travelRightPlatformPrfb: cc.Prefab = null;

    // LIFE-CYCLE CALLBACKS:

    private _canvasWidth = 0;
    private _isTouching = false;
    private _touchPos = new cc.Vec2();
    private _platformList : Array<cc.Node> = [];
    

    // onLoad () {}

    start () {
        this.subsystemInit()
        this.eventRegister()
        this.dataInit()
        this.generatePlatform()
    }

    subsystemInit() {
        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
        manager.enabledDrawBoundingBox = true;
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
        const initPlatform = cc.instantiate(this.basicPlatformPrfb)
        this.canvas.addChild(initPlatform)
        initPlatform.setPosition(0, this.canvas?.getContentSize().height/4 - 90)
        this._platformList.push(initPlatform)
    }

    onTouchStart(event: cc.Event.EventTouch) {
        this._isTouching = true;
        const location: any = event.getTouches()[0].getLocation()
        this._touchPos.x = location.x
        this._touchPos.y = location.y
    }

    onTouchMove(event: cc.Event.EventTouch) {
        this._isTouching = true;
        const location: any = event.getTouches()[0].getLocation()
        this._touchPos.x = location.x
        this._touchPos.y = location.y
    }

    onTouchEnd(event: cc.Event.EventTouch) {
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
            if (this._touchPos.x > this._canvasWidth/2) {
                this.playerCtrl.touchMove(this.playerSpeed * deltaTime)
                this.playerCtrl.touchChangeUiStatus(PlayerStatus.MoveRight)
            } else {
                this.playerCtrl.touchMove(-this.playerSpeed * deltaTime)
                this.playerCtrl.touchChangeUiStatus(PlayerStatus.MoveLeft)
            }
        } else {
            this.playerCtrl.touchChangeUiStatus(PlayerStatus.Breathing)
        }
    }
    
    // onCollisionEnter (other, self) {
    //     this.node.color = cc.Color.RED;

    //     this.touchingNumber ++;
        
    //     // 1st step 
    //     // get pre aabb, go back before collision
    //     var otherAabb = other.world.aabb;
    //     var otherPreAabb = other.world.preAabb.clone();

    //     var selfAabb = self.world.aabb;
    //     var selfPreAabb = self.world.preAabb.clone();

    //     // 2nd step
    //     // forward x-axis, check whether collision on x-axis
    //     selfPreAabb.x = selfAabb.x;
    //     otherPreAabb.x = otherAabb.x;

    //     if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb)) {
    //         if (this.speed.x < 0 && (selfPreAabb.xMax > otherPreAabb.xMax)) {
    //             this.node.x = otherPreAabb.xMax - this.node.parent.x;
    //             this.collisionX = -1;
    //         }
    //         else if (this.speed.x > 0 && (selfPreAabb.xMin < otherPreAabb.xMin)) {
    //             this.node.x = otherPreAabb.xMin - selfPreAabb.width - this.node.parent.x;
    //             this.collisionX = 1;
    //         }

    //         this.speed.x = 0;
    //         other.touchingX = true;
    //         return;
    //     }

    //     // 3rd step
    //     // forward y-axis, check whether collision on y-axis
    //     selfPreAabb.y = selfAabb.y;
    //     otherPreAabb.y = otherAabb.y;

    //     if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb)) {
    //         if (this.speed.y < 0 && (selfPreAabb.yMax > otherPreAabb.yMax)) {
    //             this.node.y = otherPreAabb.yMax - this.node.parent.y;
    //             this.jumping = false;
    //             this.collisionY = -1;
    //         }
    //         else if (this.speed.y > 0 && (selfPreAabb.yMin < otherPreAabb.yMin)) {
    //             this.node.y = otherPreAabb.yMin - selfPreAabb.height - this.node.parent.y;
    //             this.collisionY = 1;
    //         }
            
    //         this.speed.y = 0;
    //         this._lastSpeedY = 0;
    //         other.touchingY = true;
    //     }    
        
    // },
}
