export const enum GameMode {
  Invalid = "Invalid",
  MostCommon = "MostCommon",
  Common = "Common",
  Dictionary = "Dictionary",
  LeastCommon = "LeastCommon",
  CopyPastas = "CopyPastas",
  SpamTap = "SpamTap",
  Numbers = "Numbers",
  Marathon = "Marathon",
  HomeRow = "HomeRow",
  UpperRow = "UpperRow",
  RightHand = "RightHand",
  LeftHand = "LeftHand",
  AlternatingHand = "AlternatingHand",
  FakeWords = "FakeWords",
  LongestHundred = "LongestHundred",
}

export const encodeGameMode: { [key: string]: number } = {
  Invalid: 0,
  MostCommon: 1,
  Common: 2,
  Dictionary: 3,
  LeastCommon: 4,
  CopyPastas: 5,
  SpamTap: 6,
  Numbers: 7,
  Marathon: 8,
  HomeRow: 9,
  UpperRow: 10,
  RightHand: 11,
  LeftHand: 12,
  AlternatingHand: 13,
  FakeWords: 14,
  LongestHundred: 15,
};

export const decodeGameMode: { [key: number]: GameMode } = {
  0: GameMode.Invalid,
  1: GameMode.MostCommon,
  2: GameMode.Common,
  3: GameMode.Dictionary,
  4: GameMode.LeastCommon,
  5: GameMode.CopyPastas,
  6: GameMode.SpamTap,
  7: GameMode.Numbers,
  8: GameMode.Marathon,
  9: GameMode.HomeRow,
  10: GameMode.UpperRow,
  11: GameMode.RightHand,
  12: GameMode.LeftHand,
  13: GameMode.AlternatingHand,
  14: GameMode.FakeWords,
  15: GameMode.LongestHundred,
};

export const enum PlayerAuthType {
  InvalidAuthType = "InvalidAuthType",
  Anonymous = "Anonymous",
  Authenticated = "Authenticated",
}

export const encodePlayerAuthType: { [key: string]: number } = {
  InvalidAuthType: 0,
  Anonymous: 1,
  Authenticated: 2,
};

export const decodePlayerAuthType: { [key: number]: PlayerAuthType } = {
  0: PlayerAuthType.InvalidAuthType,
  1: PlayerAuthType.Anonymous,
  2: PlayerAuthType.Authenticated,
};

export interface InGamePlayer {
  name?: string;
  id?: string;
  is_bot?: boolean;
  is_you?: boolean;
}

export function encodeInGamePlayer(message: InGamePlayer): Uint8Array {
  let bb = popByteBuffer();
  _encodeInGamePlayer(message, bb);
  return toUint8Array(bb);
}

function _encodeInGamePlayer(message: InGamePlayer, bb: ByteBuffer): void {
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

  // optional bool is_bot = 3;
  let $is_bot = message.is_bot;
  if ($is_bot !== undefined) {
    writeVarint32(bb, 24);
    writeByte(bb, $is_bot ? 1 : 0);
  }

  // optional bool is_you = 4;
  let $is_you = message.is_you;
  if ($is_you !== undefined) {
    writeVarint32(bb, 32);
    writeByte(bb, $is_you ? 1 : 0);
  }
}

export function decodeInGamePlayer(binary: Uint8Array): InGamePlayer {
  return _decodeInGamePlayer(wrapByteBuffer(binary));
}

function _decodeInGamePlayer(bb: ByteBuffer): InGamePlayer {
  let message: InGamePlayer = {} as any;

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

      // optional bool is_bot = 3;
      case 3: {
        message.is_bot = !!readByte(bb);
        break;
      }

      // optional bool is_you = 4;
      case 4: {
        message.is_you = !!readByte(bb);
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
  sender_token?: string;
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

  // optional string sender_token = 2;
  let $sender_token = message.sender_token;
  if ($sender_token !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $sender_token);
  }

  // optional FindGameRequest find_game = 3;
  let $find_game = message.find_game;
  if ($find_game !== undefined) {
    writeVarint32(bb, 26);
    let nested = popByteBuffer();
    _encodeFindGameRequest($find_game, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional TypeWordRequest type_word = 4;
  let $type_word = message.type_word;
  if ($type_word !== undefined) {
    writeVarint32(bb, 34);
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

      // optional string sender_token = 2;
      case 2: {
        message.sender_token = readString(bb, readVarint32(bb));
        break;
      }

      // optional FindGameRequest find_game = 3;
      case 3: {
        let limit = pushTemporaryLength(bb);
        message.find_game = _decodeFindGameRequest(bb);
        bb.limit = limit;
        break;
      }

      // optional TypeWordRequest type_word = 4;
      case 4: {
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
  game_modes?: GameMode[];
  private_game?: boolean;
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

  // repeated GameMode game_modes = 2;
  let array$game_modes = message.game_modes;
  if (array$game_modes !== undefined) {
    let packed = popByteBuffer();
    for (let value of array$game_modes) {
      writeVarint32(packed, encodeGameMode[value]);
    }
    writeVarint32(bb, 18);
    writeVarint32(bb, packed.offset);
    writeByteBuffer(bb, packed);
    pushByteBuffer(packed);
  }

  // optional bool private_game = 3;
  let $private_game = message.private_game;
  if ($private_game !== undefined) {
    writeVarint32(bb, 24);
    writeByte(bb, $private_game ? 1 : 0);
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

      // repeated GameMode game_modes = 2;
      case 2: {
        let values = message.game_modes || (message.game_modes = []);
        if ((tag & 7) === 2) {
          let outerLimit = pushTemporaryLength(bb);
          while (!isAtEnd(bb)) {
            values.push(decodeGameMode[readVarint32(bb)]);
          }
          bb.limit = outerLimit;
        } else {
          values.push(decodeGameMode[readVarint32(bb)]);
        }
        break;
      }

      // optional bool private_game = 3;
      case 3: {
        message.private_game = !!readByte(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface KeyStroke {
  character?: string;
  time?: number;
}

export function encodeKeyStroke(message: KeyStroke): Uint8Array {
  let bb = popByteBuffer();
  _encodeKeyStroke(message, bb);
  return toUint8Array(bb);
}

function _encodeKeyStroke(message: KeyStroke, bb: ByteBuffer): void {
  // optional string character = 1;
  let $character = message.character;
  if ($character !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $character);
  }

  // optional float time = 2;
  let $time = message.time;
  if ($time !== undefined) {
    writeVarint32(bb, 21);
    writeFloat(bb, $time);
  }
}

export function decodeKeyStroke(binary: Uint8Array): KeyStroke {
  return _decodeKeyStroke(wrapByteBuffer(binary));
}

function _decodeKeyStroke(bb: ByteBuffer): KeyStroke {
  let message: KeyStroke = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string character = 1;
      case 1: {
        message.character = readString(bb, readVarint32(bb));
        break;
      }

      // optional float time = 2;
      case 2: {
        message.time = readFloat(bb);
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
  key_strokes?: KeyStroke[];
  num_errors?: number;
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

  // repeated KeyStroke key_strokes = 2;
  let array$key_strokes = message.key_strokes;
  if (array$key_strokes !== undefined) {
    for (let value of array$key_strokes) {
      writeVarint32(bb, 18);
      let nested = popByteBuffer();
      _encodeKeyStroke(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }

  // optional int32 num_errors = 3;
  let $num_errors = message.num_errors;
  if ($num_errors !== undefined) {
    writeVarint32(bb, 24);
    writeVarint64(bb, intToLong($num_errors));
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

      // repeated KeyStroke key_strokes = 2;
      case 2: {
        let limit = pushTemporaryLength(bb);
        let values = message.key_strokes || (message.key_strokes = []);
        values.push(_decodeKeyStroke(bb));
        bb.limit = limit;
        break;
      }

      // optional int32 num_errors = 3;
      case 3: {
        message.num_errors = readVarint32(bb);
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
  game_id?: string;
  game_over?: GameOver;
  game_started?: GameStarted;
  game_starting?: GameStarting;
  player_completed?: PlayerCompleted;
  player_joined_game?: PlayerJoinedGame;
  word_finished?: WordFinished;
  youve_been_added_to_game?: YouveBeenAddedToGame;
  player_disconnected?: PlayerDisconnected;
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

  // optional string game_id = 2;
  let $game_id = message.game_id;
  if ($game_id !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $game_id);
  }

  // optional GameOver game_over = 3;
  let $game_over = message.game_over;
  if ($game_over !== undefined) {
    writeVarint32(bb, 26);
    let nested = popByteBuffer();
    _encodeGameOver($game_over, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional GameStarted game_started = 4;
  let $game_started = message.game_started;
  if ($game_started !== undefined) {
    writeVarint32(bb, 34);
    let nested = popByteBuffer();
    _encodeGameStarted($game_started, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional GameStarting game_starting = 5;
  let $game_starting = message.game_starting;
  if ($game_starting !== undefined) {
    writeVarint32(bb, 42);
    let nested = popByteBuffer();
    _encodeGameStarting($game_starting, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional PlayerCompleted player_completed = 6;
  let $player_completed = message.player_completed;
  if ($player_completed !== undefined) {
    writeVarint32(bb, 50);
    let nested = popByteBuffer();
    _encodePlayerCompleted($player_completed, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional PlayerJoinedGame player_joined_game = 7;
  let $player_joined_game = message.player_joined_game;
  if ($player_joined_game !== undefined) {
    writeVarint32(bb, 58);
    let nested = popByteBuffer();
    _encodePlayerJoinedGame($player_joined_game, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional WordFinished word_finished = 8;
  let $word_finished = message.word_finished;
  if ($word_finished !== undefined) {
    writeVarint32(bb, 66);
    let nested = popByteBuffer();
    _encodeWordFinished($word_finished, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional YouveBeenAddedToGame youve_been_added_to_game = 9;
  let $youve_been_added_to_game = message.youve_been_added_to_game;
  if ($youve_been_added_to_game !== undefined) {
    writeVarint32(bb, 74);
    let nested = popByteBuffer();
    _encodeYouveBeenAddedToGame($youve_been_added_to_game, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional PlayerDisconnected player_disconnected = 10;
  let $player_disconnected = message.player_disconnected;
  if ($player_disconnected !== undefined) {
    writeVarint32(bb, 82);
    let nested = popByteBuffer();
    _encodePlayerDisconnected($player_disconnected, nested);
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

      // optional string game_id = 2;
      case 2: {
        message.game_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional GameOver game_over = 3;
      case 3: {
        let limit = pushTemporaryLength(bb);
        message.game_over = _decodeGameOver(bb);
        bb.limit = limit;
        break;
      }

      // optional GameStarted game_started = 4;
      case 4: {
        let limit = pushTemporaryLength(bb);
        message.game_started = _decodeGameStarted(bb);
        bb.limit = limit;
        break;
      }

      // optional GameStarting game_starting = 5;
      case 5: {
        let limit = pushTemporaryLength(bb);
        message.game_starting = _decodeGameStarting(bb);
        bb.limit = limit;
        break;
      }

      // optional PlayerCompleted player_completed = 6;
      case 6: {
        let limit = pushTemporaryLength(bb);
        message.player_completed = _decodePlayerCompleted(bb);
        bb.limit = limit;
        break;
      }

      // optional PlayerJoinedGame player_joined_game = 7;
      case 7: {
        let limit = pushTemporaryLength(bb);
        message.player_joined_game = _decodePlayerJoinedGame(bb);
        bb.limit = limit;
        break;
      }

      // optional WordFinished word_finished = 8;
      case 8: {
        let limit = pushTemporaryLength(bb);
        message.word_finished = _decodeWordFinished(bb);
        bb.limit = limit;
        break;
      }

      // optional YouveBeenAddedToGame youve_been_added_to_game = 9;
      case 9: {
        let limit = pushTemporaryLength(bb);
        message.youve_been_added_to_game = _decodeYouveBeenAddedToGame(bb);
        bb.limit = limit;
        break;
      }

      // optional PlayerDisconnected player_disconnected = 10;
      case 10: {
        let limit = pushTemporaryLength(bb);
        message.player_disconnected = _decodePlayerDisconnected(bb);
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

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface ErrorsAtTime {
  time?: number;
  error_count?: number;
}

export function encodeErrorsAtTime(message: ErrorsAtTime): Uint8Array {
  let bb = popByteBuffer();
  _encodeErrorsAtTime(message, bb);
  return toUint8Array(bb);
}

function _encodeErrorsAtTime(message: ErrorsAtTime, bb: ByteBuffer): void {
  // optional float time = 1;
  let $time = message.time;
  if ($time !== undefined) {
    writeVarint32(bb, 13);
    writeFloat(bb, $time);
  }

  // optional int32 error_count = 2;
  let $error_count = message.error_count;
  if ($error_count !== undefined) {
    writeVarint32(bb, 16);
    writeVarint64(bb, intToLong($error_count));
  }
}

export function decodeErrorsAtTime(binary: Uint8Array): ErrorsAtTime {
  return _decodeErrorsAtTime(wrapByteBuffer(binary));
}

function _decodeErrorsAtTime(bb: ByteBuffer): ErrorsAtTime {
  let message: ErrorsAtTime = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional float time = 1;
      case 1: {
        message.time = readFloat(bb);
        break;
      }

      // optional int32 error_count = 2;
      case 2: {
        message.error_count = readVarint32(bb);
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
  raw_wpm_by_second?: number[];
  wpm_by_second?: number[];
  wpm?: number;
  accuracy?: number;
  mode?: GameMode;
  errors_at_time?: ErrorsAtTime[];
  num_errors?: number;
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

  // repeated float raw_wpm_by_second = 3;
  let array$raw_wpm_by_second = message.raw_wpm_by_second;
  if (array$raw_wpm_by_second !== undefined) {
    let packed = popByteBuffer();
    for (let value of array$raw_wpm_by_second) {
      writeFloat(packed, value);
    }
    writeVarint32(bb, 26);
    writeVarint32(bb, packed.offset);
    writeByteBuffer(bb, packed);
    pushByteBuffer(packed);
  }

  // repeated float wpm_by_second = 4;
  let array$wpm_by_second = message.wpm_by_second;
  if (array$wpm_by_second !== undefined) {
    let packed = popByteBuffer();
    for (let value of array$wpm_by_second) {
      writeFloat(packed, value);
    }
    writeVarint32(bb, 34);
    writeVarint32(bb, packed.offset);
    writeByteBuffer(bb, packed);
    pushByteBuffer(packed);
  }

  // optional float wpm = 5;
  let $wpm = message.wpm;
  if ($wpm !== undefined) {
    writeVarint32(bb, 45);
    writeFloat(bb, $wpm);
  }

  // optional float accuracy = 6;
  let $accuracy = message.accuracy;
  if ($accuracy !== undefined) {
    writeVarint32(bb, 53);
    writeFloat(bb, $accuracy);
  }

  // optional GameMode mode = 7;
  let $mode = message.mode;
  if ($mode !== undefined) {
    writeVarint32(bb, 56);
    writeVarint32(bb, encodeGameMode[$mode]);
  }

  // repeated ErrorsAtTime errors_at_time = 8;
  let array$errors_at_time = message.errors_at_time;
  if (array$errors_at_time !== undefined) {
    for (let value of array$errors_at_time) {
      writeVarint32(bb, 66);
      let nested = popByteBuffer();
      _encodeErrorsAtTime(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }

  // optional int32 num_errors = 9;
  let $num_errors = message.num_errors;
  if ($num_errors !== undefined) {
    writeVarint32(bb, 72);
    writeVarint64(bb, intToLong($num_errors));
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

      // repeated float raw_wpm_by_second = 3;
      case 3: {
        let values = message.raw_wpm_by_second || (message.raw_wpm_by_second = []);
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

      // repeated float wpm_by_second = 4;
      case 4: {
        let values = message.wpm_by_second || (message.wpm_by_second = []);
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

      // optional float wpm = 5;
      case 5: {
        message.wpm = readFloat(bb);
        break;
      }

      // optional float accuracy = 6;
      case 6: {
        message.accuracy = readFloat(bb);
        break;
      }

      // optional GameMode mode = 7;
      case 7: {
        message.mode = decodeGameMode[readVarint32(bb)];
        break;
      }

      // repeated ErrorsAtTime errors_at_time = 8;
      case 8: {
        let limit = pushTemporaryLength(bb);
        let values = message.errors_at_time || (message.errors_at_time = []);
        values.push(_decodeErrorsAtTime(bb));
        bb.limit = limit;
        break;
      }

      // optional int32 num_errors = 9;
      case 9: {
        message.num_errors = readVarint32(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface PlayerJoinedGame {
  player?: InGamePlayer;
  game_id?: string;
}

export function encodePlayerJoinedGame(message: PlayerJoinedGame): Uint8Array {
  let bb = popByteBuffer();
  _encodePlayerJoinedGame(message, bb);
  return toUint8Array(bb);
}

function _encodePlayerJoinedGame(message: PlayerJoinedGame, bb: ByteBuffer): void {
  // optional InGamePlayer player = 1;
  let $player = message.player;
  if ($player !== undefined) {
    writeVarint32(bb, 10);
    let nested = popByteBuffer();
    _encodeInGamePlayer($player, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional string game_id = 2;
  let $game_id = message.game_id;
  if ($game_id !== undefined) {
    writeVarint32(bb, 18);
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

      // optional InGamePlayer player = 1;
      case 1: {
        let limit = pushTemporaryLength(bb);
        message.player = _decodeInGamePlayer(bb);
        bb.limit = limit;
        break;
      }

      // optional string game_id = 2;
      case 2: {
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
  wpm?: number;
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

  // optional float wpm = 6;
  let $wpm = message.wpm;
  if ($wpm !== undefined) {
    writeVarint32(bb, 53);
    writeFloat(bb, $wpm);
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

      // optional float wpm = 6;
      case 6: {
        message.wpm = readFloat(bb);
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
  current_players?: InGamePlayer[];
  phrase?: string;
}

export function encodeYouveBeenAddedToGame(message: YouveBeenAddedToGame): Uint8Array {
  let bb = popByteBuffer();
  _encodeYouveBeenAddedToGame(message, bb);
  return toUint8Array(bb);
}

function _encodeYouveBeenAddedToGame(message: YouveBeenAddedToGame, bb: ByteBuffer): void {
  // optional string game_id = 1;
  let $game_id = message.game_id;
  if ($game_id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $game_id);
  }

  // repeated InGamePlayer current_players = 2;
  let array$current_players = message.current_players;
  if (array$current_players !== undefined) {
    for (let value of array$current_players) {
      writeVarint32(bb, 18);
      let nested = popByteBuffer();
      _encodeInGamePlayer(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }

  // optional string phrase = 3;
  let $phrase = message.phrase;
  if ($phrase !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $phrase);
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

      // optional string game_id = 1;
      case 1: {
        message.game_id = readString(bb, readVarint32(bb));
        break;
      }

      // repeated InGamePlayer current_players = 2;
      case 2: {
        let limit = pushTemporaryLength(bb);
        let values = message.current_players || (message.current_players = []);
        values.push(_decodeInGamePlayer(bb));
        bb.limit = limit;
        break;
      }

      // optional string phrase = 3;
      case 3: {
        message.phrase = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface PlayerDisconnected {
  player_id?: string;
  removed?: boolean;
  is_you?: boolean;
}

export function encodePlayerDisconnected(message: PlayerDisconnected): Uint8Array {
  let bb = popByteBuffer();
  _encodePlayerDisconnected(message, bb);
  return toUint8Array(bb);
}

function _encodePlayerDisconnected(message: PlayerDisconnected, bb: ByteBuffer): void {
  // optional string player_id = 1;
  let $player_id = message.player_id;
  if ($player_id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $player_id);
  }

  // optional bool removed = 2;
  let $removed = message.removed;
  if ($removed !== undefined) {
    writeVarint32(bb, 16);
    writeByte(bb, $removed ? 1 : 0);
  }

  // optional bool is_you = 3;
  let $is_you = message.is_you;
  if ($is_you !== undefined) {
    writeVarint32(bb, 24);
    writeByte(bb, $is_you ? 1 : 0);
  }
}

export function decodePlayerDisconnected(binary: Uint8Array): PlayerDisconnected {
  return _decodePlayerDisconnected(wrapByteBuffer(binary));
}

function _decodePlayerDisconnected(bb: ByteBuffer): PlayerDisconnected {
  let message: PlayerDisconnected = {} as any;

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

      // optional bool removed = 2;
      case 2: {
        message.removed = !!readByte(bb);
        break;
      }

      // optional bool is_you = 3;
      case 3: {
        message.is_you = !!readByte(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface TimeTrial {
  id?: string;
  name?: string;
  phrase?: string;
}

export function encodeTimeTrial(message: TimeTrial): Uint8Array {
  let bb = popByteBuffer();
  _encodeTimeTrial(message, bb);
  return toUint8Array(bb);
}

function _encodeTimeTrial(message: TimeTrial, bb: ByteBuffer): void {
  // optional string id = 1;
  let $id = message.id;
  if ($id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $id);
  }

  // optional string name = 2;
  let $name = message.name;
  if ($name !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $name);
  }

  // optional string phrase = 3;
  let $phrase = message.phrase;
  if ($phrase !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $phrase);
  }
}

export function decodeTimeTrial(binary: Uint8Array): TimeTrial {
  return _decodeTimeTrial(wrapByteBuffer(binary));
}

function _decodeTimeTrial(bb: ByteBuffer): TimeTrial {
  let message: TimeTrial = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string id = 1;
      case 1: {
        message.id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string name = 2;
      case 2: {
        message.name = readString(bb, readVarint32(bb));
        break;
      }

      // optional string phrase = 3;
      case 3: {
        message.phrase = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface ListTimeTrialsResponse {
  time_trials?: TimeTrialListItem[];
}

export function encodeListTimeTrialsResponse(message: ListTimeTrialsResponse): Uint8Array {
  let bb = popByteBuffer();
  _encodeListTimeTrialsResponse(message, bb);
  return toUint8Array(bb);
}

function _encodeListTimeTrialsResponse(message: ListTimeTrialsResponse, bb: ByteBuffer): void {
  // repeated TimeTrialListItem time_trials = 1;
  let array$time_trials = message.time_trials;
  if (array$time_trials !== undefined) {
    for (let value of array$time_trials) {
      writeVarint32(bb, 10);
      let nested = popByteBuffer();
      _encodeTimeTrialListItem(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }
}

export function decodeListTimeTrialsResponse(binary: Uint8Array): ListTimeTrialsResponse {
  return _decodeListTimeTrialsResponse(wrapByteBuffer(binary));
}

function _decodeListTimeTrialsResponse(bb: ByteBuffer): ListTimeTrialsResponse {
  let message: ListTimeTrialsResponse = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // repeated TimeTrialListItem time_trials = 1;
      case 1: {
        let limit = pushTemporaryLength(bb);
        let values = message.time_trials || (message.time_trials = []);
        values.push(_decodeTimeTrialListItem(bb));
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface TimeTrialListItem {
  id?: string;
  name?: string;
  length?: number;
  time?: number;
  place?: number;
}

export function encodeTimeTrialListItem(message: TimeTrialListItem): Uint8Array {
  let bb = popByteBuffer();
  _encodeTimeTrialListItem(message, bb);
  return toUint8Array(bb);
}

function _encodeTimeTrialListItem(message: TimeTrialListItem, bb: ByteBuffer): void {
  // optional string id = 1;
  let $id = message.id;
  if ($id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $id);
  }

  // optional string name = 2;
  let $name = message.name;
  if ($name !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $name);
  }

  // optional int32 length = 3;
  let $length = message.length;
  if ($length !== undefined) {
    writeVarint32(bb, 24);
    writeVarint64(bb, intToLong($length));
  }

  // optional int32 time = 4;
  let $time = message.time;
  if ($time !== undefined) {
    writeVarint32(bb, 32);
    writeVarint64(bb, intToLong($time));
  }

  // optional int32 place = 5;
  let $place = message.place;
  if ($place !== undefined) {
    writeVarint32(bb, 40);
    writeVarint64(bb, intToLong($place));
  }
}

export function decodeTimeTrialListItem(binary: Uint8Array): TimeTrialListItem {
  return _decodeTimeTrialListItem(wrapByteBuffer(binary));
}

function _decodeTimeTrialListItem(bb: ByteBuffer): TimeTrialListItem {
  let message: TimeTrialListItem = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string id = 1;
      case 1: {
        message.id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string name = 2;
      case 2: {
        message.name = readString(bb, readVarint32(bb));
        break;
      }

      // optional int32 length = 3;
      case 3: {
        message.length = readVarint32(bb);
        break;
      }

      // optional int32 time = 4;
      case 4: {
        message.time = readVarint32(bb);
        break;
      }

      // optional int32 place = 5;
      case 5: {
        message.place = readVarint32(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface TimeTrialResult {
  id?: string;
  player_id?: string;
  best_time?: number;
  attempt_times?: number[];
  best_keystrokes?: KeyStroke[];
}

export function encodeTimeTrialResult(message: TimeTrialResult): Uint8Array {
  let bb = popByteBuffer();
  _encodeTimeTrialResult(message, bb);
  return toUint8Array(bb);
}

function _encodeTimeTrialResult(message: TimeTrialResult, bb: ByteBuffer): void {
  // optional string id = 1;
  let $id = message.id;
  if ($id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $id);
  }

  // optional string player_id = 2;
  let $player_id = message.player_id;
  if ($player_id !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $player_id);
  }

  // optional float best_time = 3;
  let $best_time = message.best_time;
  if ($best_time !== undefined) {
    writeVarint32(bb, 29);
    writeFloat(bb, $best_time);
  }

  // repeated float attempt_times = 4;
  let array$attempt_times = message.attempt_times;
  if (array$attempt_times !== undefined) {
    let packed = popByteBuffer();
    for (let value of array$attempt_times) {
      writeFloat(packed, value);
    }
    writeVarint32(bb, 34);
    writeVarint32(bb, packed.offset);
    writeByteBuffer(bb, packed);
    pushByteBuffer(packed);
  }

  // repeated KeyStroke best_keystrokes = 5;
  let array$best_keystrokes = message.best_keystrokes;
  if (array$best_keystrokes !== undefined) {
    for (let value of array$best_keystrokes) {
      writeVarint32(bb, 42);
      let nested = popByteBuffer();
      _encodeKeyStroke(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }
}

export function decodeTimeTrialResult(binary: Uint8Array): TimeTrialResult {
  return _decodeTimeTrialResult(wrapByteBuffer(binary));
}

function _decodeTimeTrialResult(bb: ByteBuffer): TimeTrialResult {
  let message: TimeTrialResult = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string id = 1;
      case 1: {
        message.id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string player_id = 2;
      case 2: {
        message.player_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional float best_time = 3;
      case 3: {
        message.best_time = readFloat(bb);
        break;
      }

      // repeated float attempt_times = 4;
      case 4: {
        let values = message.attempt_times || (message.attempt_times = []);
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

      // repeated KeyStroke best_keystrokes = 5;
      case 5: {
        let limit = pushTemporaryLength(bb);
        let values = message.best_keystrokes || (message.best_keystrokes = []);
        values.push(_decodeKeyStroke(bb));
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface ReportTimeTrialRequest {
  id?: string;
  keystrokes?: KeyStroke[];
}

export function encodeReportTimeTrialRequest(message: ReportTimeTrialRequest): Uint8Array {
  let bb = popByteBuffer();
  _encodeReportTimeTrialRequest(message, bb);
  return toUint8Array(bb);
}

function _encodeReportTimeTrialRequest(message: ReportTimeTrialRequest, bb: ByteBuffer): void {
  // optional string id = 1;
  let $id = message.id;
  if ($id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $id);
  }

  // repeated KeyStroke keystrokes = 2;
  let array$keystrokes = message.keystrokes;
  if (array$keystrokes !== undefined) {
    for (let value of array$keystrokes) {
      writeVarint32(bb, 18);
      let nested = popByteBuffer();
      _encodeKeyStroke(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }
}

export function decodeReportTimeTrialRequest(binary: Uint8Array): ReportTimeTrialRequest {
  return _decodeReportTimeTrialRequest(wrapByteBuffer(binary));
}

function _decodeReportTimeTrialRequest(bb: ByteBuffer): ReportTimeTrialRequest {
  let message: ReportTimeTrialRequest = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string id = 1;
      case 1: {
        message.id = readString(bb, readVarint32(bb));
        break;
      }

      // repeated KeyStroke keystrokes = 2;
      case 2: {
        let limit = pushTemporaryLength(bb);
        let values = message.keystrokes || (message.keystrokes = []);
        values.push(_decodeKeyStroke(bb));
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface ReportTimeTrialResponse {
  time?: number;
  wpm?: number;
}

export function encodeReportTimeTrialResponse(message: ReportTimeTrialResponse): Uint8Array {
  let bb = popByteBuffer();
  _encodeReportTimeTrialResponse(message, bb);
  return toUint8Array(bb);
}

function _encodeReportTimeTrialResponse(message: ReportTimeTrialResponse, bb: ByteBuffer): void {
  // optional float time = 1;
  let $time = message.time;
  if ($time !== undefined) {
    writeVarint32(bb, 13);
    writeFloat(bb, $time);
  }

  // optional float wpm = 2;
  let $wpm = message.wpm;
  if ($wpm !== undefined) {
    writeVarint32(bb, 21);
    writeFloat(bb, $wpm);
  }
}

export function decodeReportTimeTrialResponse(binary: Uint8Array): ReportTimeTrialResponse {
  return _decodeReportTimeTrialResponse(wrapByteBuffer(binary));
}

function _decodeReportTimeTrialResponse(bb: ByteBuffer): ReportTimeTrialResponse {
  let message: ReportTimeTrialResponse = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional float time = 1;
      case 1: {
        message.time = readFloat(bb);
        break;
      }

      // optional float wpm = 2;
      case 2: {
        message.wpm = readFloat(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface AuthenticatedAuthInfo {
  provider?: string;
  external_id?: string;
  email?: string;
  last_login_at?: number;
}

export function encodeAuthenticatedAuthInfo(message: AuthenticatedAuthInfo): Uint8Array {
  let bb = popByteBuffer();
  _encodeAuthenticatedAuthInfo(message, bb);
  return toUint8Array(bb);
}

function _encodeAuthenticatedAuthInfo(message: AuthenticatedAuthInfo, bb: ByteBuffer): void {
  // optional string provider = 1;
  let $provider = message.provider;
  if ($provider !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $provider);
  }

  // optional string external_id = 2;
  let $external_id = message.external_id;
  if ($external_id !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $external_id);
  }

  // optional string email = 3;
  let $email = message.email;
  if ($email !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $email);
  }

  // optional double last_login_at = 4;
  let $last_login_at = message.last_login_at;
  if ($last_login_at !== undefined) {
    writeVarint32(bb, 33);
    writeDouble(bb, $last_login_at);
  }
}

export function decodeAuthenticatedAuthInfo(binary: Uint8Array): AuthenticatedAuthInfo {
  return _decodeAuthenticatedAuthInfo(wrapByteBuffer(binary));
}

function _decodeAuthenticatedAuthInfo(bb: ByteBuffer): AuthenticatedAuthInfo {
  let message: AuthenticatedAuthInfo = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string provider = 1;
      case 1: {
        message.provider = readString(bb, readVarint32(bb));
        break;
      }

      // optional string external_id = 2;
      case 2: {
        message.external_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string email = 3;
      case 3: {
        message.email = readString(bb, readVarint32(bb));
        break;
      }

      // optional double last_login_at = 4;
      case 4: {
        message.last_login_at = readDouble(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface AnonAuthInfo {
  auth_token?: string;
  last_login_at?: number;
}

export function encodeAnonAuthInfo(message: AnonAuthInfo): Uint8Array {
  let bb = popByteBuffer();
  _encodeAnonAuthInfo(message, bb);
  return toUint8Array(bb);
}

function _encodeAnonAuthInfo(message: AnonAuthInfo, bb: ByteBuffer): void {
  // optional string auth_token = 1;
  let $auth_token = message.auth_token;
  if ($auth_token !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $auth_token);
  }

  // optional double last_login_at = 2;
  let $last_login_at = message.last_login_at;
  if ($last_login_at !== undefined) {
    writeVarint32(bb, 17);
    writeDouble(bb, $last_login_at);
  }
}

export function decodeAnonAuthInfo(binary: Uint8Array): AnonAuthInfo {
  return _decodeAnonAuthInfo(wrapByteBuffer(binary));
}

function _decodeAnonAuthInfo(bb: ByteBuffer): AnonAuthInfo {
  let message: AnonAuthInfo = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string auth_token = 1;
      case 1: {
        message.auth_token = readString(bb, readVarint32(bb));
        break;
      }

      // optional double last_login_at = 2;
      case 2: {
        message.last_login_at = readDouble(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface Player {
  id?: string;
  type?: PlayerAuthType;
  created_s?: number;
  authenticated_auth_info?: AuthenticatedAuthInfo;
  anon_auth_info?: AnonAuthInfo;
}

export function encodePlayer(message: Player): Uint8Array {
  let bb = popByteBuffer();
  _encodePlayer(message, bb);
  return toUint8Array(bb);
}

function _encodePlayer(message: Player, bb: ByteBuffer): void {
  // optional string id = 1;
  let $id = message.id;
  if ($id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $id);
  }

  // optional PlayerAuthType type = 2;
  let $type = message.type;
  if ($type !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, encodePlayerAuthType[$type]);
  }

  // optional double created_s = 3;
  let $created_s = message.created_s;
  if ($created_s !== undefined) {
    writeVarint32(bb, 25);
    writeDouble(bb, $created_s);
  }

  // optional AuthenticatedAuthInfo authenticated_auth_info = 4;
  let $authenticated_auth_info = message.authenticated_auth_info;
  if ($authenticated_auth_info !== undefined) {
    writeVarint32(bb, 34);
    let nested = popByteBuffer();
    _encodeAuthenticatedAuthInfo($authenticated_auth_info, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional AnonAuthInfo anon_auth_info = 5;
  let $anon_auth_info = message.anon_auth_info;
  if ($anon_auth_info !== undefined) {
    writeVarint32(bb, 42);
    let nested = popByteBuffer();
    _encodeAnonAuthInfo($anon_auth_info, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
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

      // optional string id = 1;
      case 1: {
        message.id = readString(bb, readVarint32(bb));
        break;
      }

      // optional PlayerAuthType type = 2;
      case 2: {
        message.type = decodePlayerAuthType[readVarint32(bb)];
        break;
      }

      // optional double created_s = 3;
      case 3: {
        message.created_s = readDouble(bb);
        break;
      }

      // optional AuthenticatedAuthInfo authenticated_auth_info = 4;
      case 4: {
        let limit = pushTemporaryLength(bb);
        message.authenticated_auth_info = _decodeAuthenticatedAuthInfo(bb);
        bb.limit = limit;
        break;
      }

      // optional AnonAuthInfo anon_auth_info = 5;
      case 5: {
        let limit = pushTemporaryLength(bb);
        message.anon_auth_info = _decodeAnonAuthInfo(bb);
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
