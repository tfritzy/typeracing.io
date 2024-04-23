export interface Player {
  name?: string;
  id?: string;
}

export function encodePlayer(message: Player): Uint8Array {
  let bb = popByteBuffer();
  _encodePlayer(message, bb);
  return toUint8Array(bb);
}

function _encodePlayer(message: Player, bb: ByteBuffer): void {
  // optional string name = 1;
  let $name = message.name;
  if ($name !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $name);
  }

  // optional string id = 2;
  let $id = message.id;
  if ($id !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $id);
  }
}

export function decodePlayer(binary: Uint8Array): Player {
  return _decodePlayer(wrapByteBuffer(binary));
}

function _decodePlayer(bb: ByteBuffer): Player {
  let message: Player = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string name = 1;
      case 1: {
        message.name = readString(bb, readVarint32(bb));
        break;
      }

      // optional string id = 2;
      case 2: {
        message.id = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface OneofRequest {
  sender_id?: string;
  find_game?: FindGameRequest;
  type_word?: TypeWordRequest;
}

export function encodeOneofRequest(message: OneofRequest): Uint8Array {
  let bb = popByteBuffer();
  _encodeOneofRequest(message, bb);
  return toUint8Array(bb);
}

function _encodeOneofRequest(message: OneofRequest, bb: ByteBuffer): void {
  // optional string sender_id = 1;
  let $sender_id = message.sender_id;
  if ($sender_id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $sender_id);
  }

  // optional FindGameRequest find_game = 2;
  let $find_game = message.find_game;
  if ($find_game !== undefined) {
    writeVarint32(bb, 18);
    let nested = popByteBuffer();
    _encodeFindGameRequest($find_game, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional TypeWordRequest type_word = 3;
  let $type_word = message.type_word;
  if ($type_word !== undefined) {
    writeVarint32(bb, 26);
    let nested = popByteBuffer();
    _encodeTypeWordRequest($type_word, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }
}

export function decodeOneofRequest(binary: Uint8Array): OneofRequest {
  return _decodeOneofRequest(wrapByteBuffer(binary));
}

function _decodeOneofRequest(bb: ByteBuffer): OneofRequest {
  let message: OneofRequest = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string sender_id = 1;
      case 1: {
        message.sender_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional FindGameRequest find_game = 2;
      case 2: {
        let limit = pushTemporaryLength(bb);
        message.find_game = _decodeFindGameRequest(bb);
        bb.limit = limit;
        break;
      }

      // optional TypeWordRequest type_word = 3;
      case 3: {
        let limit = pushTemporaryLength(bb);
        message.type_word = _decodeTypeWordRequest(bb);
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface FindGameRequest {
  player_name?: string;
  player_token?: string;
}

export function encodeFindGameRequest(message: FindGameRequest): Uint8Array {
  let bb = popByteBuffer();
  _encodeFindGameRequest(message, bb);
  return toUint8Array(bb);
}

function _encodeFindGameRequest(message: FindGameRequest, bb: ByteBuffer): void {
  // optional string player_name = 1;
  let $player_name = message.player_name;
  if ($player_name !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $player_name);
  }

  // optional string player_token = 2;
  let $player_token = message.player_token;
  if ($player_token !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $player_token);
  }
}

export function decodeFindGameRequest(binary: Uint8Array): FindGameRequest {
  return _decodeFindGameRequest(wrapByteBuffer(binary));
}

function _decodeFindGameRequest(bb: ByteBuffer): FindGameRequest {
  let message: FindGameRequest = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string player_name = 1;
      case 1: {
        message.player_name = readString(bb, readVarint32(bb));
        break;
      }

      // optional string player_token = 2;
      case 2: {
        message.player_token = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface TypeWordRequest {
  word?: string;
  char_completion_times?: number[];
}

export function encodeTypeWordRequest(message: TypeWordRequest): Uint8Array {
  let bb = popByteBuffer();
  _encodeTypeWordRequest(message, bb);
  return toUint8Array(bb);
}

function _encodeTypeWordRequest(message: TypeWordRequest, bb: ByteBuffer): void {
  // optional string word = 1;
  let $word = message.word;
  if ($word !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $word);
  }

  // repeated float char_completion_times = 2;
  let array$char_completion_times = message.char_completion_times;
  if (array$char_completion_times !== undefined) {
    let packed = popByteBuffer();
    for (let value of array$char_completion_times) {
      writeFloat(packed, value);
    }
    writeVarint32(bb, 18);
    writeVarint32(bb, packed.offset);
    writeByteBuffer(bb, packed);
    pushByteBuffer(packed);
  }
}

export function decodeTypeWordRequest(binary: Uint8Array): TypeWordRequest {
  return _decodeTypeWordRequest(wrapByteBuffer(binary));
}

function _decodeTypeWordRequest(bb: ByteBuffer): TypeWordRequest {
  let message: TypeWordRequest = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string word = 1;
      case 1: {
        message.word = readString(bb, readVarint32(bb));
        break;
      }

      // repeated float char_completion_times = 2;
      case 2: {
        let values = message.char_completion_times || (message.char_completion_times = []);
        if ((tag & 7) === 2) {
          let outerLimit = pushTemporaryLength(bb);
          while (!isAtEnd(bb)) {
            values.push(readFloat(bb));
          }
          bb.limit = outerLimit;
        } else {
          values.push(readFloat(bb));
        }
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface OneofUpdate {
  recipient_id?: string;
  game_over?: GameOver;
  game_started?: GameStarted;
  game_starting?: GameStarting;
  player_completed?: PlayerCompleted;
  player_joined_game?: PlayerJoinedGame;
  word_finished?: WordFinished;
  youve_been_added_to_game?: YouveBeenAddedToGame;
}

export function encodeOneofUpdate(message: OneofUpdate): Uint8Array {
  let bb = popByteBuffer();
  _encodeOneofUpdate(message, bb);
  return toUint8Array(bb);
}

function _encodeOneofUpdate(message: OneofUpdate, bb: ByteBuffer): void {
  // optional string recipient_id = 1;
  let $recipient_id = message.recipient_id;
  if ($recipient_id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $recipient_id);
  }

  // optional GameOver game_over = 2;
  let $game_over = message.game_over;
  if ($game_over !== undefined) {
    writeVarint32(bb, 18);
    let nested = popByteBuffer();
    _encodeGameOver($game_over, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional GameStarted game_started = 3;
  let $game_started = message.game_started;
  if ($game_started !== undefined) {
    writeVarint32(bb, 26);
    let nested = popByteBuffer();
    _encodeGameStarted($game_started, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional GameStarting game_starting = 4;
  let $game_starting = message.game_starting;
  if ($game_starting !== undefined) {
    writeVarint32(bb, 34);
    let nested = popByteBuffer();
    _encodeGameStarting($game_starting, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional PlayerCompleted player_completed = 5;
  let $player_completed = message.player_completed;
  if ($player_completed !== undefined) {
    writeVarint32(bb, 42);
    let nested = popByteBuffer();
    _encodePlayerCompleted($player_completed, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional PlayerJoinedGame player_joined_game = 6;
  let $player_joined_game = message.player_joined_game;
  if ($player_joined_game !== undefined) {
    writeVarint32(bb, 50);
    let nested = popByteBuffer();
    _encodePlayerJoinedGame($player_joined_game, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional WordFinished word_finished = 7;
  let $word_finished = message.word_finished;
  if ($word_finished !== undefined) {
    writeVarint32(bb, 58);
    let nested = popByteBuffer();
    _encodeWordFinished($word_finished, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional YouveBeenAddedToGame youve_been_added_to_game = 8;
  let $youve_been_added_to_game = message.youve_been_added_to_game;
  if ($youve_been_added_to_game !== undefined) {
    writeVarint32(bb, 66);
    let nested = popByteBuffer();
    _encodeYouveBeenAddedToGame($youve_been_added_to_game, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }
}

export function decodeOneofUpdate(binary: Uint8Array): OneofUpdate {
  return _decodeOneofUpdate(wrapByteBuffer(binary));
}

function _decodeOneofUpdate(bb: ByteBuffer): OneofUpdate {
  let message: OneofUpdate = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string recipient_id = 1;
      case 1: {
        message.recipient_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional GameOver game_over = 2;
      case 2: {
        let limit = pushTemporaryLength(bb);
        message.game_over = _decodeGameOver(bb);
        bb.limit = limit;
        break;
      }

      // optional GameStarted game_started = 3;
      case 3: {
        let limit = pushTemporaryLength(bb);
        message.game_started = _decodeGameStarted(bb);
        bb.limit = limit;
        break;
      }

      // optional GameStarting game_starting = 4;
      case 4: {
        let limit = pushTemporaryLength(bb);
        message.game_starting = _decodeGameStarting(bb);
        bb.limit = limit;
        break;
      }

      // optional PlayerCompleted player_completed = 5;
      case 5: {
        let limit = pushTemporaryLength(bb);
        message.player_completed = _decodePlayerCompleted(bb);
        bb.limit = limit;
        break;
      }

      // optional PlayerJoinedGame player_joined_game = 6;
      case 6: {
        let limit = pushTemporaryLength(bb);
        message.player_joined_game = _decodePlayerJoinedGame(bb);
        bb.limit = limit;
        break;
      }

      // optional WordFinished word_finished = 7;
      case 7: {
        let limit = pushTemporaryLength(bb);
        message.word_finished = _decodeWordFinished(bb);
        bb.limit = limit;
        break;
      }

      // optional YouveBeenAddedToGame youve_been_added_to_game = 8;
      case 8: {
        let limit = pushTemporaryLength(bb);
        message.youve_been_added_to_game = _decodeYouveBeenAddedToGame(bb);
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface GameOver {
  end_time_s?: number;
}

export function encodeGameOver(message: GameOver): Uint8Array {
  let bb = popByteBuffer();
  _encodeGameOver(message, bb);
  return toUint8Array(bb);
}

function _encodeGameOver(message: GameOver, bb: ByteBuffer): void {
  // optional float end_time_s = 1;
  let $end_time_s = message.end_time_s;
  if ($end_time_s !== undefined) {
    writeVarint32(bb, 13);
    writeFloat(bb, $end_time_s);
  }
}

export function decodeGameOver(binary: Uint8Array): GameOver {
  return _decodeGameOver(wrapByteBuffer(binary));
}

function _decodeGameOver(bb: ByteBuffer): GameOver {
  let message: GameOver = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional float end_time_s = 1;
      case 1: {
        message.end_time_s = readFloat(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface GameStarted {
}

export function encodeGameStarted(message: GameStarted): Uint8Array {
  let bb = popByteBuffer();
  _encodeGameStarted(message, bb);
  return toUint8Array(bb);
}

function _encodeGameStarted(message: GameStarted, bb: ByteBuffer): void {
}

export function decodeGameStarted(binary: Uint8Array): GameStarted {
  return _decodeGameStarted(wrapByteBuffer(binary));
}

function _decodeGameStarted(bb: ByteBuffer): GameStarted {
  let message: GameStarted = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface GameStarting {
  countdown?: number;
  phrase?: string;
}

export function encodeGameStarting(message: GameStarting): Uint8Array {
  let bb = popByteBuffer();
  _encodeGameStarting(message, bb);
  return toUint8Array(bb);
}

function _encodeGameStarting(message: GameStarting, bb: ByteBuffer): void {
  // optional float countdown = 1;
  let $countdown = message.countdown;
  if ($countdown !== undefined) {
    writeVarint32(bb, 13);
    writeFloat(bb, $countdown);
  }

  // optional string phrase = 2;
  let $phrase = message.phrase;
  if ($phrase !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $phrase);
  }
}

export function decodeGameStarting(binary: Uint8Array): GameStarting {
  return _decodeGameStarting(wrapByteBuffer(binary));
}

function _decodeGameStarting(bb: ByteBuffer): GameStarting {
  let message: GameStarting = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional float countdown = 1;
      case 1: {
        message.countdown = readFloat(bb);
        break;
      }

      // optional string phrase = 2;
      case 2: {
        message.phrase = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface PlayerCompleted {
  player_id?: string;
  place?: number;
  char_completion_times?: number[];
  wpm?: number;
}

export function encodePlayerCompleted(message: PlayerCompleted): Uint8Array {
  let bb = popByteBuffer();
  _encodePlayerCompleted(message, bb);
  return toUint8Array(bb);
}

function _encodePlayerCompleted(message: PlayerCompleted, bb: ByteBuffer): void {
  // optional string player_id = 1;
  let $player_id = message.player_id;
  if ($player_id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $player_id);
  }

  // optional int32 place = 2;
  let $place = message.place;
  if ($place !== undefined) {
    writeVarint32(bb, 16);
    writeVarint64(bb, intToLong($place));
  }

  // repeated float char_completion_times = 3;
  let array$char_completion_times = message.char_completion_times;
  if (array$char_completion_times !== undefined) {
    let packed = popByteBuffer();
    for (let value of array$char_completion_times) {
      writeFloat(packed, value);
    }
    writeVarint32(bb, 26);
    writeVarint32(bb, packed.offset);
    writeByteBuffer(bb, packed);
    pushByteBuffer(packed);
  }

  // optional float wpm = 4;
  let $wpm = message.wpm;
  if ($wpm !== undefined) {
    writeVarint32(bb, 37);
    writeFloat(bb, $wpm);
  }
}

export function decodePlayerCompleted(binary: Uint8Array): PlayerCompleted {
  return _decodePlayerCompleted(wrapByteBuffer(binary));
}

function _decodePlayerCompleted(bb: ByteBuffer): PlayerCompleted {
  let message: PlayerCompleted = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string player_id = 1;
      case 1: {
        message.player_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional int32 place = 2;
      case 2: {
        message.place = readVarint32(bb);
        break;
      }

      // repeated float char_completion_times = 3;
      case 3: {
        let values = message.char_completion_times || (message.char_completion_times = []);
        if ((tag & 7) === 2) {
          let outerLimit = pushTemporaryLength(bb);
          while (!isAtEnd(bb)) {
            values.push(readFloat(bb));
          }
          bb.limit = outerLimit;
        } else {
          values.push(readFloat(bb));
        }
        break;
      }

      // optional float wpm = 4;
      case 4: {
        message.wpm = readFloat(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface PlayerJoinedGame {
  player_id?: string;
  player_name?: string;
  game_id?: string;
}

export function encodePlayerJoinedGame(message: PlayerJoinedGame): Uint8Array {
  let bb = popByteBuffer();
  _encodePlayerJoinedGame(message, bb);
  return toUint8Array(bb);
}

function _encodePlayerJoinedGame(message: PlayerJoinedGame, bb: ByteBuffer): void {
  // optional string player_id = 1;
  let $player_id = message.player_id;
  if ($player_id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $player_id);
  }

  // optional string player_name = 2;
  let $player_name = message.player_name;
  if ($player_name !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $player_name);
  }

  // optional string game_id = 3;
  let $game_id = message.game_id;
  if ($game_id !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $game_id);
  }
}

export function decodePlayerJoinedGame(binary: Uint8Array): PlayerJoinedGame {
  return _decodePlayerJoinedGame(wrapByteBuffer(binary));
}

function _decodePlayerJoinedGame(bb: ByteBuffer): PlayerJoinedGame {
  let message: PlayerJoinedGame = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string player_id = 1;
      case 1: {
        message.player_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string player_name = 2;
      case 2: {
        message.player_name = readString(bb, readVarint32(bb));
        break;
      }

      // optional string game_id = 3;
      case 3: {
        message.game_id = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface WordFinished {
  player_id?: string;
  percent_complete?: number;
  velocity_km_s?: number;
  position_km?: number;
  char_completion_times?: number[];
}

export function encodeWordFinished(message: WordFinished): Uint8Array {
  let bb = popByteBuffer();
  _encodeWordFinished(message, bb);
  return toUint8Array(bb);
}

function _encodeWordFinished(message: WordFinished, bb: ByteBuffer): void {
  // optional string player_id = 1;
  let $player_id = message.player_id;
  if ($player_id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $player_id);
  }

  // optional float percent_complete = 2;
  let $percent_complete = message.percent_complete;
  if ($percent_complete !== undefined) {
    writeVarint32(bb, 21);
    writeFloat(bb, $percent_complete);
  }

  // optional float velocity_km_s = 3;
  let $velocity_km_s = message.velocity_km_s;
  if ($velocity_km_s !== undefined) {
    writeVarint32(bb, 29);
    writeFloat(bb, $velocity_km_s);
  }

  // optional float position_km = 4;
  let $position_km = message.position_km;
  if ($position_km !== undefined) {
    writeVarint32(bb, 37);
    writeFloat(bb, $position_km);
  }

  // repeated float char_completion_times = 5;
  let array$char_completion_times = message.char_completion_times;
  if (array$char_completion_times !== undefined) {
    let packed = popByteBuffer();
    for (let value of array$char_completion_times) {
      writeFloat(packed, value);
    }
    writeVarint32(bb, 42);
    writeVarint32(bb, packed.offset);
    writeByteBuffer(bb, packed);
    pushByteBuffer(packed);
  }
}

export function decodeWordFinished(binary: Uint8Array): WordFinished {
  return _decodeWordFinished(wrapByteBuffer(binary));
}

function _decodeWordFinished(bb: ByteBuffer): WordFinished {
  let message: WordFinished = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string player_id = 1;
      case 1: {
        message.player_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional float percent_complete = 2;
      case 2: {
        message.percent_complete = readFloat(bb);
        break;
      }

      // optional float velocity_km_s = 3;
      case 3: {
        message.velocity_km_s = readFloat(bb);
        break;
      }

      // optional float position_km = 4;
      case 4: {
        message.position_km = readFloat(bb);
        break;
      }

      // repeated float char_completion_times = 5;
      case 5: {
        let values = message.char_completion_times || (message.char_completion_times = []);
        if ((tag & 7) === 2) {
          let outerLimit = pushTemporaryLength(bb);
          while (!isAtEnd(bb)) {
            values.push(readFloat(bb));
          }
          bb.limit = outerLimit;
        } else {
          values.push(readFloat(bb));
        }
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface YouveBeenAddedToGame {
  game_id?: string;
  current_players?: Player[];
}

export function encodeYouveBeenAddedToGame(message: YouveBeenAddedToGame): Uint8Array {
  let bb = popByteBuffer();
  _encodeYouveBeenAddedToGame(message, bb);
  return toUint8Array(bb);
}

function _encodeYouveBeenAddedToGame(message: YouveBeenAddedToGame, bb: ByteBuffer): void {
  // optional string game_id = 2;
  let $game_id = message.game_id;
  if ($game_id !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $game_id);
  }

  // repeated Player current_players = 3;
  let array$current_players = message.current_players;
  if (array$current_players !== undefined) {
    for (let value of array$current_players) {
      writeVarint32(bb, 26);
      let nested = popByteBuffer();
      _encodePlayer(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }
}

export function decodeYouveBeenAddedToGame(binary: Uint8Array): YouveBeenAddedToGame {
  return _decodeYouveBeenAddedToGame(wrapByteBuffer(binary));
}

function _decodeYouveBeenAddedToGame(bb: ByteBuffer): YouveBeenAddedToGame {
  let message: YouveBeenAddedToGame = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string game_id = 2;
      case 2: {
        message.game_id = readString(bb, readVarint32(bb));
        break;
      }

      // repeated Player current_players = 3;
      case 3: {
        let limit = pushTemporaryLength(bb);
        let values = message.current_players || (message.current_players = []);
        values.push(_decodePlayer(bb));
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface Long {
  low: number;
  high: number;
  unsigned: boolean;
}

interface ByteBuffer {
  bytes: Uint8Array;
  offset: number;
  limit: number;
}

function pushTemporaryLength(bb: ByteBuffer): number {
  let length = readVarint32(bb);
  let limit = bb.limit;
  bb.limit = bb.offset + length;
  return limit;
}

function skipUnknownField(bb: ByteBuffer, type: number): void {
  switch (type) {
    case 0: while (readByte(bb) & 0x80) { } break;
    case 2: skip(bb, readVarint32(bb)); break;
    case 5: skip(bb, 4); break;
    case 1: skip(bb, 8); break;
    default: throw new Error("Unimplemented type: " + type);
  }
}

function stringToLong(value: string): Long {
  return {
    low: value.charCodeAt(0) | (value.charCodeAt(1) << 16),
    high: value.charCodeAt(2) | (value.charCodeAt(3) << 16),
    unsigned: false,
  };
}

function longToString(value: Long): string {
  let low = value.low;
  let high = value.high;
  return String.fromCharCode(
    low & 0xFFFF,
    low >>> 16,
    high & 0xFFFF,
    high >>> 16);
}

// The code below was modified from https://github.com/protobufjs/bytebuffer.js
// which is under the Apache License 2.0.

let f32 = new Float32Array(1);
let f32_u8 = new Uint8Array(f32.buffer);

let f64 = new Float64Array(1);
let f64_u8 = new Uint8Array(f64.buffer);

function intToLong(value: number): Long {
  value |= 0;
  return {
    low: value,
    high: value >> 31,
    unsigned: value >= 0,
  };
}

let bbStack: ByteBuffer[] = [];

function popByteBuffer(): ByteBuffer {
  const bb = bbStack.pop();
  if (!bb) return { bytes: new Uint8Array(64), offset: 0, limit: 0 };
  bb.offset = bb.limit = 0;
  return bb;
}

function pushByteBuffer(bb: ByteBuffer): void {
  bbStack.push(bb);
}

function wrapByteBuffer(bytes: Uint8Array): ByteBuffer {
  return { bytes, offset: 0, limit: bytes.length };
}

function toUint8Array(bb: ByteBuffer): Uint8Array {
  let bytes = bb.bytes;
  let limit = bb.limit;
  return bytes.length === limit ? bytes : bytes.subarray(0, limit);
}

function skip(bb: ByteBuffer, offset: number): void {
  if (bb.offset + offset > bb.limit) {
    throw new Error('Skip past limit');
  }
  bb.offset += offset;
}

function isAtEnd(bb: ByteBuffer): boolean {
  return bb.offset >= bb.limit;
}

function grow(bb: ByteBuffer, count: number): number {
  let bytes = bb.bytes;
  let offset = bb.offset;
  let limit = bb.limit;
  let finalOffset = offset + count;
  if (finalOffset > bytes.length) {
    let newBytes = new Uint8Array(finalOffset * 2);
    newBytes.set(bytes);
    bb.bytes = newBytes;
  }
  bb.offset = finalOffset;
  if (finalOffset > limit) {
    bb.limit = finalOffset;
  }
  return offset;
}

function advance(bb: ByteBuffer, count: number): number {
  let offset = bb.offset;
  if (offset + count > bb.limit) {
    throw new Error('Read past limit');
  }
  bb.offset += count;
  return offset;
}

function readBytes(bb: ByteBuffer, count: number): Uint8Array {
  let offset = advance(bb, count);
  return bb.bytes.subarray(offset, offset + count);
}

function writeBytes(bb: ByteBuffer, buffer: Uint8Array): void {
  let offset = grow(bb, buffer.length);
  bb.bytes.set(buffer, offset);
}

function readString(bb: ByteBuffer, count: number): string {
  // Sadly a hand-coded UTF8 decoder is much faster than subarray+TextDecoder in V8
  let offset = advance(bb, count);
  let fromCharCode = String.fromCharCode;
  let bytes = bb.bytes;
  let invalid = '\uFFFD';
  let text = '';

  for (let i = 0; i < count; i++) {
    let c1 = bytes[i + offset], c2: number, c3: number, c4: number, c: number;

    // 1 byte
    if ((c1 & 0x80) === 0) {
      text += fromCharCode(c1);
    }

    // 2 bytes
    else if ((c1 & 0xE0) === 0xC0) {
      if (i + 1 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        if ((c2 & 0xC0) !== 0x80) text += invalid;
        else {
          c = ((c1 & 0x1F) << 6) | (c2 & 0x3F);
          if (c < 0x80) text += invalid;
          else {
            text += fromCharCode(c);
            i++;
          }
        }
      }
    }

    // 3 bytes
    else if ((c1 & 0xF0) == 0xE0) {
      if (i + 2 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        if (((c2 | (c3 << 8)) & 0xC0C0) !== 0x8080) text += invalid;
        else {
          c = ((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
          if (c < 0x0800 || (c >= 0xD800 && c <= 0xDFFF)) text += invalid;
          else {
            text += fromCharCode(c);
            i += 2;
          }
        }
      }
    }

    // 4 bytes
    else if ((c1 & 0xF8) == 0xF0) {
      if (i + 3 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        c4 = bytes[i + offset + 3];
        if (((c2 | (c3 << 8) | (c4 << 16)) & 0xC0C0C0) !== 0x808080) text += invalid;
        else {
          c = ((c1 & 0x07) << 0x12) | ((c2 & 0x3F) << 0x0C) | ((c3 & 0x3F) << 0x06) | (c4 & 0x3F);
          if (c < 0x10000 || c > 0x10FFFF) text += invalid;
          else {
            c -= 0x10000;
            text += fromCharCode((c >> 10) + 0xD800, (c & 0x3FF) + 0xDC00);
            i += 3;
          }
        }
      }
    }

    else text += invalid;
  }

  return text;
}

function writeString(bb: ByteBuffer, text: string): void {
  // Sadly a hand-coded UTF8 encoder is much faster than TextEncoder+set in V8
  let n = text.length;
  let byteCount = 0;

  // Write the byte count first
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    byteCount += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }
  writeVarint32(bb, byteCount);

  let offset = grow(bb, byteCount);
  let bytes = bb.bytes;

  // Then write the bytes
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    if (c < 0x80) {
      bytes[offset++] = c;
    } else {
      if (c < 0x800) {
        bytes[offset++] = ((c >> 6) & 0x1F) | 0xC0;
      } else {
        if (c < 0x10000) {
          bytes[offset++] = ((c >> 12) & 0x0F) | 0xE0;
        } else {
          bytes[offset++] = ((c >> 18) & 0x07) | 0xF0;
          bytes[offset++] = ((c >> 12) & 0x3F) | 0x80;
        }
        bytes[offset++] = ((c >> 6) & 0x3F) | 0x80;
      }
      bytes[offset++] = (c & 0x3F) | 0x80;
    }
  }
}

function writeByteBuffer(bb: ByteBuffer, buffer: ByteBuffer): void {
  let offset = grow(bb, buffer.limit);
  let from = bb.bytes;
  let to = buffer.bytes;

  // This for loop is much faster than subarray+set on V8
  for (let i = 0, n = buffer.limit; i < n; i++) {
    from[i + offset] = to[i];
  }
}

function readByte(bb: ByteBuffer): number {
  return bb.bytes[advance(bb, 1)];
}

function writeByte(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 1);
  bb.bytes[offset] = value;
}

function readFloat(bb: ByteBuffer): number {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f32_u8[0] = bytes[offset++];
  f32_u8[1] = bytes[offset++];
  f32_u8[2] = bytes[offset++];
  f32_u8[3] = bytes[offset++];
  return f32[0];
}

function writeFloat(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  f32[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f32_u8[0];
  bytes[offset++] = f32_u8[1];
  bytes[offset++] = f32_u8[2];
  bytes[offset++] = f32_u8[3];
}

function readDouble(bb: ByteBuffer): number {
  let offset = advance(bb, 8);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f64_u8[0] = bytes[offset++];
  f64_u8[1] = bytes[offset++];
  f64_u8[2] = bytes[offset++];
  f64_u8[3] = bytes[offset++];
  f64_u8[4] = bytes[offset++];
  f64_u8[5] = bytes[offset++];
  f64_u8[6] = bytes[offset++];
  f64_u8[7] = bytes[offset++];
  return f64[0];
}

function writeDouble(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 8);
  let bytes = bb.bytes;
  f64[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f64_u8[0];
  bytes[offset++] = f64_u8[1];
  bytes[offset++] = f64_u8[2];
  bytes[offset++] = f64_u8[3];
  bytes[offset++] = f64_u8[4];
  bytes[offset++] = f64_u8[5];
  bytes[offset++] = f64_u8[6];
  bytes[offset++] = f64_u8[7];
}

function readInt32(bb: ByteBuffer): number {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  );
}

function writeInt32(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  bytes[offset] = value;
  bytes[offset + 1] = value >> 8;
  bytes[offset + 2] = value >> 16;
  bytes[offset + 3] = value >> 24;
}

function readInt64(bb: ByteBuffer, unsigned: boolean): Long {
  return {
    low: readInt32(bb),
    high: readInt32(bb),
    unsigned,
  };
}

function writeInt64(bb: ByteBuffer, value: Long): void {
  writeInt32(bb, value.low);
  writeInt32(bb, value.high);
}

function readVarint32(bb: ByteBuffer): number {
  let c = 0;
  let value = 0;
  let b: number;
  do {
    b = readByte(bb);
    if (c < 32) value |= (b & 0x7F) << c;
    c += 7;
  } while (b & 0x80);
  return value;
}

function writeVarint32(bb: ByteBuffer, value: number): void {
  value >>>= 0;
  while (value >= 0x80) {
    writeByte(bb, (value & 0x7f) | 0x80);
    value >>>= 7;
  }
  writeByte(bb, value);
}

function readVarint64(bb: ByteBuffer, unsigned: boolean): Long {
  let part0 = 0;
  let part1 = 0;
  let part2 = 0;
  let b: number;

  b = readByte(bb); part0 = (b & 0x7F); if (b & 0x80) {
    b = readByte(bb); part0 |= (b & 0x7F) << 7; if (b & 0x80) {
      b = readByte(bb); part0 |= (b & 0x7F) << 14; if (b & 0x80) {
        b = readByte(bb); part0 |= (b & 0x7F) << 21; if (b & 0x80) {

          b = readByte(bb); part1 = (b & 0x7F); if (b & 0x80) {
            b = readByte(bb); part1 |= (b & 0x7F) << 7; if (b & 0x80) {
              b = readByte(bb); part1 |= (b & 0x7F) << 14; if (b & 0x80) {
                b = readByte(bb); part1 |= (b & 0x7F) << 21; if (b & 0x80) {

                  b = readByte(bb); part2 = (b & 0x7F); if (b & 0x80) {
                    b = readByte(bb); part2 |= (b & 0x7F) << 7;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    low: part0 | (part1 << 28),
    high: (part1 >>> 4) | (part2 << 24),
    unsigned,
  };
}

function writeVarint64(bb: ByteBuffer, value: Long): void {
  let part0 = value.low >>> 0;
  let part1 = ((value.low >>> 28) | (value.high << 4)) >>> 0;
  let part2 = value.high >>> 24;

  // ref: src/google/protobuf/io/coded_stream.cc
  let size =
    part2 === 0 ?
      part1 === 0 ?
        part0 < 1 << 14 ?
          part0 < 1 << 7 ? 1 : 2 :
          part0 < 1 << 21 ? 3 : 4 :
        part1 < 1 << 14 ?
          part1 < 1 << 7 ? 5 : 6 :
          part1 < 1 << 21 ? 7 : 8 :
      part2 < 1 << 7 ? 9 : 10;

  let offset = grow(bb, size);
  let bytes = bb.bytes;

  switch (size) {
    case 10: bytes[offset + 9] = (part2 >>> 7) & 0x01;
    case 9: bytes[offset + 8] = size !== 9 ? part2 | 0x80 : part2 & 0x7F;
    case 8: bytes[offset + 7] = size !== 8 ? (part1 >>> 21) | 0x80 : (part1 >>> 21) & 0x7F;
    case 7: bytes[offset + 6] = size !== 7 ? (part1 >>> 14) | 0x80 : (part1 >>> 14) & 0x7F;
    case 6: bytes[offset + 5] = size !== 6 ? (part1 >>> 7) | 0x80 : (part1 >>> 7) & 0x7F;
    case 5: bytes[offset + 4] = size !== 5 ? part1 | 0x80 : part1 & 0x7F;
    case 4: bytes[offset + 3] = size !== 4 ? (part0 >>> 21) | 0x80 : (part0 >>> 21) & 0x7F;
    case 3: bytes[offset + 2] = size !== 3 ? (part0 >>> 14) | 0x80 : (part0 >>> 14) & 0x7F;
    case 2: bytes[offset + 1] = size !== 2 ? (part0 >>> 7) | 0x80 : (part0 >>> 7) & 0x7F;
    case 1: bytes[offset] = size !== 1 ? part0 | 0x80 : part0 & 0x7F;
  }
}

function readVarint32ZigZag(bb: ByteBuffer): number {
  let value = readVarint32(bb);

  // ref: src/google/protobuf/wire_format_lite.h
  return (value >>> 1) ^ -(value & 1);
}

function writeVarint32ZigZag(bb: ByteBuffer, value: number): void {
  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint32(bb, (value << 1) ^ (value >> 31));
}

function readVarint64ZigZag(bb: ByteBuffer): Long {
  let value = readVarint64(bb, /* unsigned */ false);
  let low = value.low;
  let high = value.high;
  let flip = -(low & 1);

  // ref: src/google/protobuf/wire_format_lite.h
  return {
    low: ((low >>> 1) | (high << 31)) ^ flip,
    high: (high >>> 1) ^ flip,
    unsigned: false,
  };
}

function writeVarint64ZigZag(bb: ByteBuffer, value: Long): void {
  let low = value.low;
  let high = value.high;
  let flip = high >> 31;

  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint64(bb, {
    low: (low << 1) ^ flip,
    high: ((high << 1) | (low >>> 31)) ^ flip,
    unsigned: false,
  });
}
