class Tuner {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.mediaStream = null;
        this.isRunning = false;
        this.onNoteDetected = null;
    }

    async start() {
        if (this.isRunning) return;

        try {
            // Request microphone access first
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            // Create audio context after getting permission
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;

            this.mediaStream = stream;
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.analyser);

            this.isRunning = true;
            this.updatePitch();
            console.log("Tuner started successfully");
        } catch (error) {
            console.error('Error starting tuner:', error);
            throw error;
        }
    }

    stop() {
        if (!this.isRunning) return;

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.isRunning = false;
        console.log("Tuner stopped");
    }

    updatePitch() {
        if (!this.isRunning) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const buffer = new Float32Array(bufferLength);
        this.analyser.getFloatTimeDomainData(buffer);

        const ac = this.autoCorrelate(buffer, this.audioContext.sampleRate);
        
        if (ac !== -1) {
            const note = this.getNote(ac);
            if (this.onNoteDetected) {
                this.onNoteDetected({
                    frequency: ac,
                    note: note
                });
            }
        }

        requestAnimationFrame(() => this.updatePitch());
    }

    autoCorrelate(buffer, sampleRate) {
        const SIZE = buffer.length;
        const MAX_SAMPLES = Math.floor(SIZE/2);
        let bestOffset = -1;
        let bestCorrelation = 0;
        let rms = 0;
        let foundGoodCorrelation = false;

        // Calculate RMS
        for (let i = 0; i < SIZE; i++) {
            const val = buffer[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms/SIZE);

        // Not enough signal
        if (rms < 0.01) return -1;

        let lastCorrelation = 1;
        for (let offset = 0; offset < MAX_SAMPLES; offset++) {
            let correlation = 0;

            for (let i = 0; i < MAX_SAMPLES; i++) {
                correlation += Math.abs((buffer[i]) - (buffer[i + offset]));
            }

            correlation = 1 - (correlation/MAX_SAMPLES);
            if (correlation > 0.9 && correlation > lastCorrelation) {
                foundGoodCorrelation = true;
                if (correlation > bestCorrelation) {
                    bestCorrelation = correlation;
                    bestOffset = offset;
                }
            } else if (foundGoodCorrelation) {
                break;
            }
            lastCorrelation = correlation;
        }

        if (bestCorrelation > 0.01) {
            return sampleRate/bestOffset;
        }
        return -1;
    }

    getNote(frequency) {
        const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const a4 = 440;
        const c0 = a4 * Math.pow(2, -4.75);
        
        if (frequency < c0) return "Too low";
        
        const h = Math.round(12 * Math.log2(frequency/c0));
        const octave = Math.floor(h/12);
        const noteIndex = h % 12;
        return notes[noteIndex] + octave;
    }
}

// Export the Tuner class
window.Tuner = Tuner; 