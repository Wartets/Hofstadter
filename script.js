document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('butterflyCanvas');
    const ctx = canvas.getContext('2d');
    const calculateBtn = document.getElementById('calculateBtn');
    const statusDiv = document.getElementById('status');
    
    calculateBtn.addEventListener('click', calculateButterfly);
    
    function calculateButterfly() {
        const Ny = parseInt(document.getElementById('ny').value);
        const numPhases = parseInt(document.getElementById('numPhases').value);
        const numPoints = parseInt(document.getElementById('numPoints').value);
        const q = parseInt(document.getElementById('fluxDenom').value);
        const t = 1;
        
        calculateBtn.disabled = true;
        statusDiv.textContent = 'Calcul en cours... (cela peut prendre quelques secondes)';
        
        setTimeout(() => {
            try {
                const points = [];
                
                for (let i = 0; i < numPoints; i++) {
                    const phi = i / numPoints;
                    
                    for (let phaseIndex = 0; phaseIndex < numPhases; phaseIndex++) {
                        const phi_x = (2 * Math.PI * phaseIndex) / numPhases;
                        const H = math.zeros(Ny, Ny);
                        
                        for (let m = 0; m < Ny; m++) {
                            const diag = 2 * t * Math.cos(2 * Math.PI * m * phi + phi_x);
                            H.set([m, m], math.complex(diag, 0));
                            
                            const next = (m + 1) % Ny;
                            const prev = (m - 1 + Ny) % Ny;
                            
                            H.set([m, next], math.complex(t, 0));
                            H.set([m, prev], math.complex(t, 0));
                        }
                        
                        const A = math.zeros(2 * Ny, 2 * Ny);
                        
                        for (let i1 = 0; i1 < Ny; i1++) {
                            for (let j1 = 0; j1 < Ny; j1++) {
                                const c = H.get([i1, j1]);
                                const re = math.re(c);
                                const im = math.im(c);
                                
                                A.set([i1, j1], re);
                                A.set([i1, j1 + Ny], -im);
                                A.set([i1 + Ny, j1], im);
                                A.set([i1 + Ny, j1 + Ny], re);
                            }
                        }
                        
                        const ev = math.eigs(A);
                        const eigenvalues = ev.values;
                        
                        for (let k = 0; k < eigenvalues.length; k++) {
                            points.push({ x: phi, y: eigenvalues[k] });
                        }
                    }
                    
                    if (i % 10 === 0) {
                        statusDiv.textContent = `Calcul: ${Math.round((i / numPoints) * 100)}%`;
                    }
                }
                
                drawButterfly(points);
                statusDiv.textContent = 'Calcul terminé!';
            } catch (error) {
                statusDiv.textContent = `Erreur: ${error.message}`;
                console.error(error);
            } finally {
                calculateBtn.disabled = false;
            }
        }, 100);
    }
    
    function drawButterfly(points) {
        const width = canvas.width;
        const height = canvas.height;
        const yMin = -4;
        const yMax = 4;
        
        ctx.clearRect(0, 0, width, height);
        
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50, height - 50);
        ctx.lineTo(width - 50, height - 50);
        ctx.moveTo(50, 50);
        ctx.lineTo(50, height - 50);
        ctx.stroke();
        
        ctx.fillStyle = '#2c3e50';
        ctx.font = '14px Arial';
        ctx.fillText('Φ (Flux magnétique)', width / 2 - 50, height - 10);
        ctx.save();
        ctx.translate(20, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Énergie (t)', 0, 0);
        ctx.restore();
        
        ctx.fillStyle = 'rgba(52, 152, 219, 0.6)';
        
        for (const point of points) {
            const x = 50 + (point.x * (width - 100));
            const y = 50 + ((point.y - yMin) / (yMax - yMin)) * (height - 100);
            
            if (y >= 50 && y <= height - 50) {
                ctx.fillRect(x, height - y, 2, 2);
            }
        }
        
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '12px Arial';
        ctx.fillText('0', 45, height - 45);
        ctx.fillText('1', width - 45, height - 45);
        ctx.fillText('0', 35, height - 50);
        ctx.fillText('4', 35, 55);
        ctx.fillText('-4', 35, height - 55);
    }
});