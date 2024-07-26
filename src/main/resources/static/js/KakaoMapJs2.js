$(document).ready(function () {
// 마커를 담을 배열입니다
    var markers = [];

    var mapContainer = document.getElementById('map'), // 지도를 표시할 div
        mapOption = {
            center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
            level: 3 // 지도의 확대 레벨
        };

// 지도를 생성합니다
    var map = new kakao.maps.Map(mapContainer, mapOption);

// 장소 검색 객체를 생성합니다
    var ps = new kakao.maps.services.Places();

// 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
    var infowindow = new kakao.maps.InfoWindow({zIndex: 1});

// 키워드로 장소를 검색합니다
    searchPlaces();

// 키워드 검색을 요청하는 함수입니다
    function searchPlaces() {
        var keyword = document.getElementById("address-input").value;
        if (!keyword.replace(/^\s+|\s+$/g, '')) {
            alert('키워드를 입력해주세요!');
            return false;
        }

        // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
        ps.keywordSearch(keyword, placesSearchCB);
    }

// 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
    function placesSearchCB(data, status, pagination) {

        if (status === kakao.maps.services.Status.OK) {

            $.ajax({
                url: "/api/wcInfoList",
                method: "POST",
                dataType: "json",
                success: function (wcInfoList) {

                    alert(wcInfoList.length)
                    displayPlaces(wcInfoList);
                },
                error: function () {
                    console.log("Request failed: " + textStatus);
                    console.log("Error thrown: " + errorThrown);
                    console.log("Response text: " + jqXHR.responseText);
                    alert("An error occurred while processing your request. Please check the console for more details.");
                }
            });

        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {

            alert('검색 결과가 존재하지 않습니다.');
            return;

        } else if (status === kakao.maps.services.Status.ERROR) {

            alert('검색 결과 중 오류가 발생했습니다.');
            return;

        }
    }

// 검색 결과 목록과 마커를 표출하는 함수입니다
    function displayPlaces(places) {
        // var listEl = document.getElementById('placesList'),
        var listEl = document.getElementById('underList'),
            menuEl = document.getElementById('menu_wrap'),
            fragment = document.createDocumentFragment(),
            bounds = new kakao.maps.LatLngBounds(),
            listStr = '';

        // 검색 결과 목록에 추가된 항목들을 제거합니다
        removeAllChildNods(listEl);

        // 지도에 표시되고 있는 마커를 제거합니다
        removeMarker();

        for (var i = 0; i < places.length; i++) {

            // 마커를 생성하고 지도에 표시합니다
            var placePosition = new kakao.maps.LatLng(places[i].latitude, places[i].longitude),
                marker = addMarker(placePosition, i),
                itemEl = underListItem(i, places[i]);

            bounds.extend(placePosition);

            (function (marker, title) {
                kakao.maps.event.addListener(marker, 'mouseover', function () {
                    displayInfowindow(marker, title);
                });

                kakao.maps.event.addListener(marker, 'mouseout', function () {
                    infowindow.close();
                });

                itemEl.onmouseover = function () {
                    displayInfowindow(marker, title);
                };

                itemEl.onmouseout = function () {
                    infowindow.close();
                };
            })(marker, places[i].point);

            fragment.appendChild(itemEl);
        }

        // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
        listEl.appendChild(fragment);
        // menuEl.scrollTop = 0;

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
    }


// 검색결과 항목을 Element로 반환하는 함수입니다
    function getListItem(index, places) {
        // var el = document.createElement('li')
        var el = document.createElement('li')
        var itemStr = '<span class="markerbg marker_' + (index + 1) + '"></span>' +
            '<div class="info">' +
            '   <h5>' + places.place_name + '</h5>';

        if (places.road_address_name) {
            itemStr += '    <span>' + places.road_address_name + '</span>' +
                '   <span class="jibun gray">' + places.address_name + '</span>';
        } else {
            itemStr += '    <span>' + places.address_name + '</span>';
        }

        itemStr += '  <span class="tel">' + places.phone + '</span>' +
            '</div>';

        el.innerHTML = itemStr;
        el.className = 'item';

        return el;
    }


    function underListItem(index, place) {

        var timeText = place.time;
        var addressText = place.addr1;
        var keyText = '********';

        var div = document.createElement('div');
        div.className = 'col-sm-6 mb-5';

        var itemStr = `
        <div class="d-flex position-relative">
            <div class="box_img">
                <img src="/images/step_icon01.svg" alt="1단계 아이콘">
            </div>
            <div class="iconWrap">
                <div class="d-flex icon">
                    <p class="me-3">
                        <img src="/images/thumb_up.svg" alt="좋아요 아이콘">
                        <span class="ms-1">10</span>
                    </p>
                    <p>
                        <img src="/images/thumb_down.svg" alt="싫어요 아이콘"><span class="ms-1">0</span>
                    </p>
                </div>
            </div>
        </div>
        <hr>
        <div class="listBox d-flex">
            <img src="/images/time.svg" alt="시간 아이콘">
            <p>개방시간 : <span>${timeText}</span></p>
        </div>
        <div class="listBox d-flex">
            <img src="/images/address.svg" alt="위치 아이콘">
            <p>주소 : <span>${addressText}</span></p>
        </div>
        <div class="listBox d-flex">
            <img src="/images/key.svg" alt="키 아이콘">
            <p>키 : <span>${keyText}</span></p>
        </div>
        <div>
            <button class="btn btn-primary mt-2">자세히 보기</button>
        </div>
    `;
        div.innerHTML = itemStr;

        return div;
    }

// 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
    function addMarker(position, idx, title) {
        var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
        // var imageSrc = "/images/marker.gif", // 마커 이미지 url, 스프라이트 이미지를 씁니다
        //     imageSize = new kakao.maps.Size(70, 70),  // 마커 이미지의 크기
            imageSize = new kakao.maps.Size(39, 40),  // 마커 이미지의 크기
            imgOptions = {
                spriteSize : new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
                spriteOrigin : new kakao.maps.Point(0, (idx*46)+10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
                offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
            },
            markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
            marker = new kakao.maps.Marker({
                position: position, // 마커의 위치
                image: markerImage
            });

        marker.setMap(map); // 지도 위에 마커를 표출합니다
        markers.push(marker);  // 배열에 생성된 마커를 추가합니다

        return marker;
    }

// 지도 위에 표시되고 있는 마커를 모두 제거합니다
    function removeMarker() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
    }

// 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
    function displayPagination(pagination) {
        var paginationEl = document.getElementById('pagination'),
            fragment = document.createDocumentFragment(),
            i;

        // 기존에 추가된 페이지번호를 삭제합니다
        while (paginationEl.hasChildNodes()) {
            paginationEl.removeChild(paginationEl.lastChild);
        }

        for (i = 1; i <= pagination.last; i++) {
            var el = document.createElement('a');
            el.href = "#";
            el.innerHTML = i;

            if (i === pagination.current) {
                el.className = 'on';
            } else {
                el.onclick = (function (i) {
                    return function () {
                        pagination.gotoPage(i);
                    }
                })(i);
            }

            fragment.appendChild(el);
        }
        paginationEl.appendChild(fragment);
    }

// 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
// 인포윈도우에 장소명을 표시합니다
    function displayInfowindow(marker, title) {
        var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';

        infowindow.setContent(content);
        infowindow.open(map, marker);
    }

// 검색결과 목록의 자식 Element를 제거하는 함수입니다
    function removeAllChildNods(el) {
        while (el.hasChildNodes()) {
            el.removeChild(el.lastChild);
        }
    }

});
