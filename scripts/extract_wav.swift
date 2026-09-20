import AudioToolbox
import AVFoundation
import CoreMedia
import Foundation

enum ExtractError: Error {
  case usage
  case noAudioTrack
  case cannotStartReader(String)
  case coreAudio(String, OSStatus)
}

func checkStatus(_ status: OSStatus, _ operation: String) throws {
  guard status == noErr else {
    throw ExtractError.coreAudio(operation, status)
  }
}

let args = CommandLine.arguments
guard args.count == 3 else {
  throw ExtractError.usage
}

let sourceURL = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])
let asset = AVURLAsset(url: sourceURL)
let tracks = try await asset.loadTracks(withMediaType: .audio)
guard let track = tracks.first else {
  throw ExtractError.noAudioTrack
}

let outputSettings: [String: Any] = [
  AVFormatIDKey: kAudioFormatLinearPCM,
  AVSampleRateKey: 44_100,
  AVNumberOfChannelsKey: 1,
  AVLinearPCMBitDepthKey: 16,
  AVLinearPCMIsBigEndianKey: false,
  AVLinearPCMIsFloatKey: false,
  AVLinearPCMIsNonInterleaved: false,
]

let reader = try AVAssetReader(asset: asset)
let readerOutput = AVAssetReaderTrackOutput(track: track, outputSettings: outputSettings)
reader.add(readerOutput)
guard reader.startReading() else {
  throw ExtractError.cannotStartReader(reader.error?.localizedDescription ?? "unknown reader error")
}

var asbd = AudioStreamBasicDescription(
  mSampleRate: 44_100,
  mFormatID: kAudioFormatLinearPCM,
  mFormatFlags: kLinearPCMFormatFlagIsSignedInteger | kLinearPCMFormatFlagIsPacked,
  mBytesPerPacket: 2,
  mFramesPerPacket: 1,
  mBytesPerFrame: 2,
  mChannelsPerFrame: 1,
  mBitsPerChannel: 16,
  mReserved: 0
)

var outputFile: ExtAudioFileRef?
try? FileManager.default.removeItem(at: outputURL)
try checkStatus(
  ExtAudioFileCreateWithURL(
    outputURL as CFURL,
    kAudioFileWAVEType,
    &asbd,
    nil,
    AudioFileFlags.eraseFile.rawValue,
    &outputFile
  ),
  "ExtAudioFileCreateWithURL"
)

guard let outputFile else {
  throw ExtractError.coreAudio("ExtAudioFileCreateWithURL", -1)
}

defer {
  ExtAudioFileDispose(outputFile)
}

try checkStatus(
  ExtAudioFileSetProperty(
    outputFile,
    kExtAudioFileProperty_ClientDataFormat,
    UInt32(MemoryLayout<AudioStreamBasicDescription>.size),
    &asbd
  ),
  "ExtAudioFileSetProperty"
)

while reader.status == .reading {
  guard let sampleBuffer = readerOutput.copyNextSampleBuffer(),
        let blockBuffer = CMSampleBufferGetDataBuffer(sampleBuffer) else {
    break
  }

  var lengthAtOffset = 0
  var totalLength = 0
  var dataPointer: UnsafeMutablePointer<Int8>?
  let pointerStatus = CMBlockBufferGetDataPointer(
    blockBuffer,
    atOffset: 0,
    lengthAtOffsetOut: &lengthAtOffset,
    totalLengthOut: &totalLength,
    dataPointerOut: &dataPointer
  )
  try checkStatus(pointerStatus, "CMBlockBufferGetDataPointer")

  guard let dataPointer, totalLength > 0 else {
    continue
  }

  var audioBuffer = AudioBuffer(
    mNumberChannels: 1,
    mDataByteSize: UInt32(totalLength),
    mData: UnsafeMutableRawPointer(dataPointer)
  )
  var audioBufferList = AudioBufferList(
    mNumberBuffers: 1,
    mBuffers: audioBuffer
  )
  let frames = UInt32(totalLength / Int(asbd.mBytesPerFrame))
  try checkStatus(ExtAudioFileWrite(outputFile, frames, &audioBufferList), "ExtAudioFileWrite")
  CMSampleBufferInvalidate(sampleBuffer)
}

if reader.status == .failed {
  throw reader.error ?? ExtractError.coreAudio("AVAssetReader", -1)
}
