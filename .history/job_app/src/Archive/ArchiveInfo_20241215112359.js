const ArchiveInfo = ({ selectedImageInfo }) => {
    return (
      <div>
        <h1>Image Info</h1>
        <p>Selected Image ID: {selectedImageInfo}</p>
        {/* ID에 해당하는 이미지나 정보 등을 표시할 수 있습니다 */}
      </div>
    );
  };
  
  export default ArchiveInfo;