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
    Hurt,
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

    @property(cc.Node)
    leftWallNode: cc.Node = null;
    @property(cc.Node)
    rightWallNode: cc.Node = null;

    // @property({type: GameManager})
    // public gameManager: GameManager = null;

    private _statusChange = false;
    private _prevStatus: PlayerStatus = PlayerStatus.Breathing;
    private _deltaPos: cc.Vec2 = new cc.Vec2();
    private _isContactWall = false;
    private _isContactPlatform = false;
    private _initSpeed = 100;
    private _speed = this._initSpeed;
    private _aSpeed = 200;
    private _maxSpeed = 600;
    public _platformDeltaY = 0;

    private _collisionY = false;

    private _leftXTouched = false;
    private _leftXTouchObj: cc.BoxCollider = null;
    private _rightXTouched = false;
    private _rightXTouchObj: cc.BoxCollider = null;
    
    public hpPoint = 3;


    private _isHurt = false;
    private _isFalled = false;
    private _isTraveled = false;
    private _travelLeft = false;
    private _travelRight = false;

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
        // cc.log(this.uiStatus)
        if (this._speed > this._initSpeed) this.uiStatus = PlayerStatus.Falling
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
                case PlayerStatus.Hurt:
                    anim.play('hurt');
                    break;
            
                default:
                    break;
            }
            // this._statusChange = false;
            this._prevStatus = this.uiStatus;
        }
    }

    updateNodePos(deltaTime: number) {
        if (!this._collisionY) {
            this._speed = Math.min(this._aSpeed*deltaTime + this._speed, this._maxSpeed)
            // this._deltaPos.y -= this._speed*deltaTime
            // 改成触发其他平台的加X位置事件
            this._platformDeltaY += this._speed*deltaTime
        }

        // 判断是否碰到墙，更新后能碰到的话不继续移动

        let newPos = new cc.Vec2()
        cc.Vec2.add(newPos, this.node.getPosition(), this._deltaPos)
        this.node.setPosition(newPos)
        this._deltaPos.x = 0
    }

    touchMove(distance: number) {
        if (this._isFalled || this._isHurt) {
            return
        }
        
        if (this._leftXTouched && distance < 0) return
        if (this._rightXTouched && distance > 0) return
        this._deltaPos.x += distance;
    }

    touchChangeUiStatus(uiStatus: PlayerStatus) {
        if (this._isFalled || this._isHurt) {
            return
        }

        this.uiStatus = uiStatus
    }

    onCollisionEnter (other: cc.BoxCollider, self: cc.BoxCollider) {
        if (other.node.group === 'Heart') {
            this.plusHP()
            this.node.emit('deleteFallPlatform', other.node)
            return;
        }




        // 1st step 
        // get pre aabb, go back before collision
        const otherAabb = other.world.aabb;
        const otherPreAabb = other.world.preAabb.clone();
        const selfAabb = self.world.aabb;
        const selfPreAabb = self.world.preAabb.clone();

        const threshold = 10;

        // 2nd step
        // check whether collision on y-axis
        // if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb) && (selfPreAabb.yMin + 10) > otherPreAabb.yMax) {
        if ((selfPreAabb.yMin + threshold) > otherPreAabb.yMax) {
            this._collisionY = true
            this._speed = 0

            const otherNode = other.node as any
            if (otherNode._name === 'HurtPlatform') {
                this.minusHP()
                this._isHurt = true;
                this.uiStatus = PlayerStatus.Hurt;
                this.scheduleOnce(() => {
                    cc.log('hurt')
                    this._isHurt = false;
                    this.uiStatus = PlayerStatus.Breathing;
                    this.node.emit('deleteFallPlatform', otherNode);
                }, 0.5)
            } else if (otherNode._name === 'FallPlatform') {
                this._isFalled = true;
                this.uiStatus = PlayerStatus.Falled;
                this.scheduleOnce(() => {
                    cc.log('fall')
                    this._isFalled = false;
                    this.uiStatus = PlayerStatus.Breathing;
                    this.node.emit('deleteFallPlatform', otherNode);
                }, 0.5)
            } else if (otherNode._name === 'TravelLeftPlatform') {
                this._isTraveled = true;
                this._travelLeft = true;
            } else if (otherNode._name === 'TravelRightPlatform') {
                this._isTraveled = true;
                this._travelRight = true;
            }
            // this._platformDeltaY += selfPreAabb.yMin - otherPreAabb.yMax
            return
        }
        // 3rd step
        // check whether collision on x-axis
        selfPreAabb.x = selfAabb.x;
        otherPreAabb.x = otherAabb.x;
        if (other === this.leftWallNode.getComponent(cc.BoxCollider)) {
            this._leftXTouched = true;
            this._leftXTouchObj = other;
            this._deltaPos.x += otherPreAabb.xMax - selfPreAabb.xMin;
            return;
        }
        // if (selfPreAabb.xMin > otherPreAabb.xMax - threshold) {
        if (selfPreAabb.x > otherPreAabb.x) {
            this._leftXTouched = true;
            this._leftXTouchObj = other;
            // this._deltaPos.x += otherPreAabb.xMax - selfPreAabb.xMin;
            return;
        }

        if (other === this.rightWallNode.getComponent(cc.BoxCollider)) {
            this._rightXTouched = true;
            this._rightXTouchObj = other;
            this._deltaPos.x += otherPreAabb.xMin - selfPreAabb.xMax;
            return;
        }
        // if (selfPreAabb.xMax < otherPreAabb.xMin + threshold) {
        if (selfPreAabb.x < otherPreAabb.x) {
            this._rightXTouched = true;
            this._rightXTouchObj = other;
            // this._deltaPos.x += otherPreAabb.xMin - selfPreAabb.xMax;
            return;
        }
        
    }
    onCollisionStay (other: cc.BoxCollider, self: cc.BoxCollider) {

    }
    onCollisionExit (other: cc.BoxCollider, self: cc.BoxCollider) {
        if (other.node.group === 'Heart') {
            return;
        }

        if (this._leftXTouched && this._leftXTouchObj === other) {
            this._leftXTouched = false;
            this._leftXTouchObj = null;
            return;
        }
        if (this._rightXTouched && this._rightXTouchObj === other) {
            this._rightXTouched = false;
            this._rightXTouchObj = null;
            return;
        }
        this._collisionY = false
        this._speed = this._initSpeed

    }

    plusHP(count:number = 1) {
        if (this.hpPoint < 3) this.hpPoint++;
        // 可能有播放加血音效
    }

    minusHP(count:number = 1) {
        this.hpPoint--;
        // 可能有播放减血音效
    }
}
