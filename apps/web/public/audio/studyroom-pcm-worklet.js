/* Runs off the UI thread. Input is the already-published LiveKit microphone. */
class StudyRoomPcm extends AudioWorkletProcessor {
  constructor() {
    super();
    this.next = 0;
    this.consumed = 0;
    this.previous = 0;
    this.samples = new Float32Array(16000 * 15);
    this.size = 0;
    this.energy = 0;
    this.peak = 0;
    this.flushing = false;
    this.port.onmessage = (event) => {
      if (event.data.type === "flush") {
        this.flushing = true;
        this.emit(true);
      }
    };
  }
  emit(flushed = false) {
    const samples = this.samples.slice(0, this.size);
    const voiced = this.size > 0 && (Math.sqrt(this.energy / this.size) > 0.001 || this.peak > 0.02);
    this.port.postMessage({ samples, voiced, flushed }, [samples.buffer]);
    this.size = 0; this.energy = 0; this.peak = 0;
  }
  process(inputs, outputs) {
    // Silence output: never play or duplicate the microphone signal.
    for (const output of outputs) for (const channel of output) channel.fill(0);
    if (this.flushing) return false;
    const channels = inputs[0];
    if (!channels || !channels[0]) return true;
    const input = channels[0];
    const end = this.consumed + input.length;
    const step = sampleRate / 16000;
    const mono = (index) => {
      if (index < 0) return this.previous;
      let value = 0;
      for (const channel of channels) value += channel[index] || 0;
      return value / channels.length;
    };
    while (this.next < end - 1) {
      const position = this.next - this.consumed;
      const index = Math.floor(position);
      const first = mono(index), second = mono(index + 1);
      const value = first + (second - first) * (position - index);
      this.samples[this.size++] = value;
      this.energy += value * value;
      this.peak = Math.max(this.peak, Math.abs(value));
      this.next += step;
      if (this.size === this.samples.length) this.emit();
    }
    this.previous = mono(input.length - 1);
    this.consumed = end;
    return true;
  }
}
registerProcessor("studyroom-pcm", StudyRoomPcm);
