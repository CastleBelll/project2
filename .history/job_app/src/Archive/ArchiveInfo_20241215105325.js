import React from "react";

const ArchiveInfo = ({ selectedImage }) => {
  // selectedImage에 대한 정보는 이미 ID로 넘어오므로, 해당 이미지 정보를 찾아서 출력할 수 있습니다.
  return (
    <div className="archive-info">
      <h2>선택된 이미지 정보</h2>
      <img
        src={`/images/${selectedImage + 1}.png`} // ID가 0부터 시작이므로, +1을 해주어야 합니다.
        alt={`Selected Image ${selectedImage}`}
        style={{ width: "100%", maxWidth: "500px", height: "auto" }}
      />
      <p>이미지 ID: {selectedImage}</p>
      {/* 선택된 이미지에 대한 추가적인 정보를 여기에 표시할 수 있습니다. */}
    </div>
  );
};

export default ArchiveInfo;
