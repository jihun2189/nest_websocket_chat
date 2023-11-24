const socket = io('http://localhost:3000/chat'); // 네임스페이스 추가, 주소값 뒤에 네임스페이스 추가해주면 됨
const roomSocket = io('http://localhost:3000/room') // 채팅방용 네임스페이스 생성

const nickname = prompt('닉네임을 입력해주세요.'); // 닉네임 입력받기
let currentRoom = ''; // 채팅방 초기값

// --------------------------------------------------------------------------- chat 이벤트 처리
socket.on('connect', () => {
    console.log('connected');
});

socket.on('message', (message) => {
    $('#chat').append(`<div>${message}</div>`);
});

socket.on('notice', (data) => {
    $('#notice').append(`<div>${data.message}</div>`);
})

// -----------------------------------------------------------------------------------------버튼 함수
function sendMessage() {
    if(currentRoom === '') {
        alert('방을 선택해 주세요');
        return;
    }
    const message = $('#message').val();
    const data = { message, nickname, room: currentRoom };
    $('#chat').append(`<div>나 : ${message}</div>`); // 내가 보낸 메시지 바로 추가
    roomSocket.emit('message', data); // RoomGateway로 메시지 보내기
    return false;
}

function createRoom() {
    const room = prompt('생성할 방의 이름을 입력해 주세요');
    roomSocket.emit('createRoom', { room, nickname }); // createRoom이라는 이벤트 발생시키고 room, nickname을 가진 객체 서버에 전달
}

function joinRoom(room) {
    // 서버 측의 joinRoom 이벤트 발생
    roomSocket.emit('joinRoom', { room, nickname, toLeaveRoom: currentRoom });
    $('#chat').html('') // 채팅방 이동 시 기존 메시지 삭제
    currentRoom = room; // 현재 들어 있는 방의 값을 변경
}

// -----------------------------------------------------------------------------------------------room 이벤트 처리
// 클라이언트 측에서 채팅방 추가하는 함수
roomSocket.on('message', (data) => { // 메시지 입력
    console.log(data);
    $('#chat').append(`<div>${data.message}</div>`);
});

roomSocket.on('rooms', (data) => { // 채팅방
    console.log(data);
    $('#rooms').empty(); // 채팅방 갱신 시 일단 리스트를 비움
    data.forEach((room) => {
        $('#rooms').append(`<li>${room} <button onclick="joinRoom('${room}')">join</button></li>`)
    });
});






