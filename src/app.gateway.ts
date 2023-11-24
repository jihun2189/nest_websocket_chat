import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'

// namespace : namespace로 지정된 곳에만 이벤트를 발생시키고 메시지 전송하는 개념
@WebSocketGateway({ namespace : 'chat' }) // @WebSocketGateway(port, options) 포트와 옵션 설정 가능, 안하면 3000포트 
export class ChatGateWay {
    @WebSocketServer() server : Server; // 웹소켓 서버 인스턴스에 접근하는 데코레이터

    @SubscribeMessage('message') // message 이벤트 발생시 실행
    handleMessage(socket: Socket, data : any): void {
        // 접속한 클라이언트들에 메시지 전송
        const { message, nickname } = data;
        socket.broadcast.emit('message', `${nickname}: ${message}`);
    }
}

@WebSocketGateway({ namespace : 'room' })
export class RoomGateway {
    // 채팅 게이트웨이 의존성 주입
    constructor(private readonly chatGateway : ChatGateWay) {}
    rooms = [];

    @WebSocketServer() server : Server;

    @SubscribeMessage('createRoom') // createRoom 핸들러 메서드
    handleMessage(@MessageBody() data) {
        const { nickname, room } = data;
        this.chatGateway.server.emit('notice', {
            message: `${nickname}님이 ${room}방을 만들었습니다.`
        })
        this.rooms.push(room); // 채팅방 정보 받아서 추가
        this.server.emit('rooms', this.rooms) // rooms 이벤트로 채팅방 리스트 전송
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(socket: Socket, data) {
        const { nickname, room, toLeaveRoom } = data;
        socket.leave(toLeaveRoom); // 기존의 방에서 먼저 나감
        this.chatGateway.server.emit('notice', {
            message: `${nickname}님이 ${room}방에 입장했습니다.`
        });
        socket.join(room); // 새로운 방에 입장
    }

    @SubscribeMessage('message')
    handleMessageToRoom(socket: Socket, data) {
        const { nickname, room, message } = data;
        console.log(data);
        socket.broadcast.to(room).emit('message', {
            message: `${nickname}: ${message}`
        });
    }
}