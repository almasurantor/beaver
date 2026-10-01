'use client';

export default function PingPongAnimation() {
  return (
    <>
      <style jsx>{`
        .pingpong-animation {
          margin: 0 auto;
          width: 450px;
          height: 225px;
          margin-top: 0vh;
          position: relative;
          transform: scale(1.2);
        }
        .clear {
          clear: both;
        }
        .foot1 {
          width: 2px;
          height: 80px;
          position: absolute;
          margin-top: 200px;
          z-index: -2;
          margin-left: 41px;
          background: linear-gradient(to bottom, rgba(0,0,0,1) 19%, rgba(0,0,0,1) 28%, rgba(124,58,237,0.3) 100%);
        }
        .foot2 {
          width: 2px;
          height: 80px;
          position: absolute;
          margin-top: 220px;
          z-index: -2;
          margin-left: 100px;
          background: linear-gradient(to bottom, rgba(0,0,0,1) 11%, rgba(124,58,237,0.3) 99%);
        }
        .foot3 {
          width: 2px;
          height: 80px;
          position: absolute;
          margin-top: 220px;
          z-index: -2;
          margin-left: 411px;
          background: linear-gradient(to bottom, rgba(0,0,0,1) 11%, rgba(124,58,237,0.3) 99%);
        }
        .foot4 {
          width: 2px;
          height: 80px;
          position: absolute;
          margin-top: 200px;
          z-index: -2;
          margin-left: 352px;
          background: linear-gradient(to bottom, rgba(0,0,0,1) 37%, rgba(124,58,237,0.3) 100%);
        }
        .net-inner {
          width: 95%;
          margin-left: 2%;
          height: 3px;
          margin-top: 2px;
          border-top: 1px dashed black;
          border-bottom: 1px dashed black;
        }
        .handle-left {
          width: 16px;
          height: 52px;
          margin-top: 22px;
          background: linear-gradient(to right, rgba(124,58,237,0.8) 0%, rgba(167,139,250,1) 79%);
          transform: rotate(53deg);
          border-radius: 7px;
        }
        .handle-right {
          width: 16px;
          border-radius: 7px;
          height: 40px;
          margin-left: 59px;
          margin-top: 37px;
          z-index: 0;
          position: absolute;
          background: linear-gradient(to right, rgba(124,58,237,0.8) 0%, rgba(167,139,250,1) 79%);
          transform: rotate(-53deg);
        }
        .center-line {
          width: 100%;
          height: 12px;
          border-bottom: 1px solid white;
        }
        .angle-table {
          background-color: #1E293B;
          width: 25px;
          height: 5px;
          margin-left: 2px;
          margin-top: 205px;
          position: absolute;
        }
        .angle-table2 {
          background-color: #1E293B;
          width: 500px;
          height: 5px;
          margin-left: 50px;
          margin-top: 224px;
          position: absolute;
        }
        .table-floor {
          width: 500px;
          height: 20px;
          margin-top: 205px;
          background: linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(30,58,138,1) 50%, rgba(0,0,0,0.95) 50%, rgba(0,0,0,0.95) 50%, rgba(0,0,0,0.95) 55%, rgba(30,58,138,1) 90%);
          margin-left: 25px;
          position: absolute;
          transform: skew(74deg);
        }
        .table-floor2 {
          width: 500px;
          height: 20px;
          margin-top: 210px;
          background-color: #1E293B;
          margin-left: 25px;
          position: absolute;
          z-index: -1;
          transform: skew(74deg);
        }
        .net {
          border-left: 2px solid #1E293B;
          border-right: 6px solid #1E293B;
          padding-top: 2px;
          transform: skew(13deg, 9deg) rotateX(326deg) rotateZ(10deg);
          width: 102px;
          height: 30px;
          z-index: 1;
          margin-top: 187px;
          background-color: white;
          border-radius: 2px;
          margin-left: 224px;
          position: absolute;
        }
        .left_wall {
          float: left;
          width: 60px;
          transform: rotateY(66deg);
          border-radius: 50px;
          height: 60px;
          background: #EF4444;
          animation: left-wall 3s infinite;
          margin-left: -33px;
          z-index: 5;
          position: absolute;
        }
        .left_wall2 {
          float: left;
          width: 60px;
          transform: rotateY(66deg);
          border-radius: 50px;
          height: 60px;
          background: linear-gradient(to right, rgba(220,38,38,1) 0%, rgba(239,68,68,1) 100%);
          animation: left-wall 3s infinite;
          margin-left: -36px;
          z-index: 5;
          position: absolute;
        }
        .right_wall {
          float: right;
          width: 60px;
          transform: rotateY(66deg);
          border-radius: 50px;
          height: 60px;
          background: linear-gradient(to right, rgba(59,130,246,1) 0%, rgba(37,99,235,1) 100%, rgba(59,130,246,1) 100%);
          animation: right-wall 3s infinite;
          margin-left: 490px;
          position: absolute;
          z-index: 0;
        }
        .right_wall2 {
          float: right;
          width: 60px;
          transform: rotateY(66deg);
          border-radius: 50px;
          height: 60px;
          background: rgba(37,99,235,0.8);
          animation: right-wall 3s infinite;
          margin-left: 493px;
          position: absolute;
          z-index: -1;
        }
        .ball {
          float: left;
          width: 14px;
          height: 14px;
          position: absolute;
          background: linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 50%, rgba(124,58,237,0.3) 83%, rgba(255,255,255,1) 100%);
          border-radius: 50%;
          margin-top: 22px;
          border: 1px solid rgba(124,58,237,0.5);
          animation: bounce_ball 3s linear infinite;
        }
        .ball-shadow {
          width: 16px;
          margin-top: -9px;
          height: 20px;
          transform: rotateX(82deg);
          border-radius: 23px;
          background-color: rgba(0,0,0,0.5);
          animation: bounce_ballshadow 3s linear infinite;
        }
        @keyframes bounce_ball {
          0% { margin-top: 75px; margin-left: 0px; z-index: 0; }
          25% { margin-left: 312px; margin-top: 204px; z-index: 0; }
          50% { margin-left: 490px; margin-top: 135px; z-index: 3; }
          75% { margin-left: 90px; margin-top: 204px; }
          100% { margin-left: 0px; margin-top: 75px; }
        }
        @keyframes bounce_ballshadow {
          0% { margin-left: -30px; transform: rotateX(90deg); }
          25% { margin-left: 282px; transform: rotateX(85deg); }
          50% { margin-left: 450px; transform: rotateX(90deg); }
          75% { margin-left: 60px; transform: rotateX(85deg); }
          100% { margin-left: -30px; transform: rotateX(90deg); }
        }
        @keyframes left-wall {
          0% { margin-top: 52px; transform: rotateY(66deg) rotateX(0deg); }
          15% { margin-top: 127px; transform: rotateY(66deg) rotateX(-20deg); }
          100% { margin-top: 52px; }
        }
        @keyframes right-wall {
          0% { margin-top: 75px; transform: rotateY(66deg) rotateX(0deg); }
          45% { margin-top: 75px; transform: rotateY(66deg) rotateX(10deg); }
          55% { margin-top: 112px; transform: rotateY(66deg) rotateX(-10deg); }
          100% { margin-top: 75px; transform: rotateY(66deg) rotateX(0deg); }
        }
      `}</style>
      <div className="pingpong-animation">
        <div className="left_wall">
          <div className="handle-left"></div>
        </div>
        <div className="left_wall2"></div>
        <div className="net">
          <div className="net-inner"></div>
          <div className="net-inner"></div>
          <div className="net-inner"></div>
          <div className="net-inner"></div>
          <div className="net-inner"></div>
        </div>
        <div className="angle-table"></div>
        <div className="table-floor">
          <div className="center-line"></div>
          <div className="ball-shadow"></div>
        </div>
        <div className="table-floor2"></div>
        <div className="angle-table2"></div>
        <div className="ball"></div>
        <div className="right_wall">
          <div className="handle-right"></div>
        </div>
        <div className="right_wall2"></div>
        <div className="clear"></div>
      </div>
    </>
  );
}
