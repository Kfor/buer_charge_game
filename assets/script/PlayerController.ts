// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

// import GameManager from "./GameManager";

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

    // @property({type: GameManager})
    // public gameManager: GameManager = null;

    private _statusChange = false;
    private _prevStatus: PlayerStatus = PlayerStatus.Breathing;
    private _deltaPos: cc.Vec2 = new cc.Vec2();
    private _isContactWall = false;
    private _isContactPlatform = false;
    private _speed = 0;
    private _aSpeed = 200;
    private _maxSpeed = 600;
    public _platformDeltaY = 0;

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
        this.updateUiStatus()
        this.updateNodePos(deltaTime)
    }

    updateUiStatus() {
        if (this._prevStatus !== this.uiStatus) {
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

    updateNodePos(deltaTime: number) {
        this._speed = Math.min(this._aSpeed*deltaTime + this._speed, this._maxSpeed)
        // this._deltaPos.y -= this._speed*deltaTime
        // 改成触发其他平台的加X位置事件
        this._platformDeltaY += this._speed*deltaTime

        // 判断是否碰到墙，更新后能碰到的话不继续移动

        let newPos = new cc.Vec2()
        cc.Vec2.add(newPos, this.node.getPosition(), this._deltaPos)
        this.node.setPosition(newPos)
        this._deltaPos.x = 0
    }

    touchMove(distance: number) {
        this._deltaPos.x += distance;
    }

    touchChangeUiStatus(uiStatus: PlayerStatus) {
        this.uiStatus = uiStatus
    }

    onCollisionEnter (other, self) {
        cc.log('enter')
        cc.log(other, self)

        // 触发加生命事件，通知gamemanager，destroy生命node
        
        
        // basic platform，y速度变成0，位置微调或不调，改状态为碰撞到

        // move传送带platform，y速度变成0，改状态为碰撞到且不能左右移动（另一个move状态），在更新位置时根据这个状态改x速度

        // fall platform，y速度变成0，触发音效200ms，改状态为碰撞到且不能左右移动500ms（另一个fall状态），定时500ms后将这个状态改回来，销毁fallplatform，其他状态也记得调整

        // hurt platform，触发减少生命事件，y速度变成0，位置微调或不调，改状态为碰撞到
    }
    onCollisionStay (other, self) {
        cc.log('stay')
        cc.log(other, self)
    }
    onCollisionExit (other, self) {
        cc.log('exit')
        cc.log(other, self)

        // 判断是否改状态为不碰撞到
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
