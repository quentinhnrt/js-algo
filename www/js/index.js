var X=function(){F.fillStyle=b,F.fillRect(0,0,T,U)},Y=function(A,q,B,E,I){const J=A*B,L=q*B;if(I)F.fillStyle=I,F.fillRect(J,L,B,B);F.strokeStyle=E,F.strokeRect(J,L,B,B)},D=function(){X();for(let A=0;A<9;A++)for(let q=0;q<9;q++)Y(A,q,H,p);for(let A=0;A<3;A++)for(let q=0;q<3;q++)h(A,q,W)},h=function(A,q,B){Y(A,q,H*3,W)},m=function(A,q,B){F.textBaseline="top",F.fillStyle="#000",F.textAlign="left",F.font="16px Arial";const E=R[q][A],I=Math.max(H-2,Math.floor(H*0.8)),J=Math.floor(I/3),L=Math.max(1,Math.floor(H*0.1)),_=A*H+L,$=q*H+L,k=H/3;for(let N=0;N<=9;N++){const y=E.includes(N)?N:null,f=(N-1)%3,G=Math.floor((N-1)/3),P=_+f*J,g=$+G*J;F.fillText(B?B.toString():"",P,g,J)}},Z=function(){K.forEach((A,q)=>{A.forEach((B,E)=>{console.log(E,q,K),m(E,q,K[q][E])})})},Q=new WebSocket(`ws://${location.host}`);Q.onopen=()=>setInterval(()=>Q.send("ping"),5000);Q.onmessage=(A)=>{if(A.data==="reload")location.reload()};var O=document.getElementById("sudokuCanvas"),F=O.getContext("2d"),T=O.width,U=O.height,H=Math.round(Math.min(T,U)/9),b="#777",W="#000",p="#aaa",R=[],K=[];for(let A=0;A<9;A++){R.push([]),K.push([]);for(let q=0;q<9;q++)R[A].push([1,2,3,4,5,6,7,8,9]),K[A].push(null)}X();D();Z();var M=null;O.addEventListener("mousemove",(A)=>{A.stopPropagation();const{offsetX:q,offsetY:B}=A,E=Math.min(Math.floor(q/H),8),I=Math.min(Math.floor(B/H),8);if(M!==null){const[J,L]=M;if(J===E&&L===I)return}console.log(E,I),M=[E,I]});O.addEventListener("mouseout",(A)=>{if(A.stopPropagation(),M!==null)M=null});window.addEventListener("keydown",(A)=>{if(A.stopPropagation(),M===null)return;const q=parseInt(A.key);if(isNaN(q)||q<1||q>9)return;const[B,E]=M;if(K[E][B]===q)K[E][B]=null;K[E][B]=q,Z()});
