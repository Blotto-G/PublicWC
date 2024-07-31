package bitc.fullstack405.publicwc.controller;

import bitc.fullstack405.publicwc.entity.Favorite;
import bitc.fullstack405.publicwc.entity.Users;
import bitc.fullstack405.publicwc.entity.WcInfo;
import bitc.fullstack405.publicwc.service.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/location") // API 경로를 통일하기 위한 기본 경로 설정
public class LocationController {

//    private final LocationController locationService;

//    @Autowired
//    JusoService jusoService;

    @Autowired
    ToiletService toiletService;

    @Autowired
    BestService bestService;

    @Autowired
    FavoriteService favoriteService;

//    @Autowired
//    public LocationController(LocationService locationService) {
//        this.locationService = locationService;
//    }
//
//    @GetMapping("/get-location") // GET 메서드로 변경
//    public ResponseEntity<String> getLocation(@RequestParam double lat, @RequestParam double lon) {
//        try {
//            String address = locationService.(lat, lon);
//            return new ResponseEntity<>(address, HttpStatus.OK);
//        } catch (RuntimeException e) {
//            return new ResponseEntity<>("주소를 가져오는데 실패했습니다: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }

//    @GetMapping("/address")
//    public String getAddress(@RequestParam String juso) {
//        return jusoService.getAddress(juso);
//    }
//
//    @GetMapping("/get-location") // GET 메서드로 위치 정보를 가져옴
//    public ResponseEntity<String> getLocation(@RequestParam double lat, @RequestParam double lon) {
//        try {
//            // 위도와 경도로 주소를 가져옴
//            String address = locationService.getAddress(lat, lon);
//            return new ResponseEntity<>(address, HttpStatus.OK);
//        } catch (RuntimeException e) {
//            // 주소를 가져오지 못한 경우 에러 메시지 반환
//            return new ResponseEntity<>("주소를 가져오는데 실패했습니다: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }
//}

    @GetMapping("/search.do")
    public ModelAndView searchMap(@RequestParam String juso) {
        ModelAndView mv = new ModelAndView();

        mv.addObject("jusoValue", juso);
        mv.setViewName("/board/boardList");

        return mv;
    }

    @PostMapping("/wcInfoList")
    @ResponseBody
    public Object getWcInfoList(String juso) {
        List<WcInfo> wcInfoList = toiletService.parsingWc(juso);

        return wcInfoList;
    }

    @GetMapping("/wcDetail")
    public ModelAndView wcDetail(@RequestParam("wcId") String wcId, HttpSession session) {
        ModelAndView mv = new ModelAndView();
        mv.setViewName("board/boardDetail");

        int wcIntId = Integer.parseInt(wcId);
        WcInfo wcInfo = toiletService.findWcInfoById(wcIntId);

        mv.addObject("userId", session.getAttribute("userId"));
        mv.addObject("wcId", wcId);
        mv.addObject("wcInfo", wcInfo);


        return mv;
    }

    @ResponseBody
    @PostMapping("/best")
    public Object bestTest(@RequestParam("userId") String userId, @RequestParam("wcId") int wcId, String kind) {
//        카운트 업
        if (kind.equals("like")) {
            bestService.likeCountUp(userId, wcId);
        } else {
            bestService.hateCountUp(userId, wcId);
        }

//        현재 카운트 수 가져오기
        int likeCount = bestService.getLikeCount(wcId);
        int hateCount = bestService.getHateCount(wcId);

        Map<String, Integer> map = new HashMap<>();
        map.put("likeCount", likeCount);
        map.put("hateCount", hateCount);
//        가져온 카운트 수 클라이언트로 반환
        return map;
    }

    //    등록되어있는 좋아요 싫어요 띄움
    @ResponseBody
    @GetMapping("/getCount")
    public Object getCount(@RequestParam("wcId") int wcId) {
        int likeCount = bestService.getLikeCount(wcId);
        int hateCount = bestService.getHateCount(wcId);

        Map<String, Integer> map = new HashMap<>();
        map.put("likeCount", likeCount);
        map.put("hateCount", hateCount);

        return map;
    }

    @ResponseBody
    @GetMapping("/getCountList")
    public Object getCount(@RequestParam("wcIdList") List<Integer> wcIdList) throws Exception {

        List<Map<String, Integer>> likeCountList = bestService.getLikeCountList(wcIdList);
        List<Map<String, Integer>> hateCountList = bestService.getHateCountList(wcIdList);

        Map<String, List<Map<String, Integer>>> map = new HashMap<>();
        map.put("likeList", likeCountList);
        map.put("hateList", hateCountList);

        return map;
    }

    // 즐겨찾기부분
    @ResponseBody
    @PostMapping("/favorites")
    public Object addFavorite(@RequestParam("userId") String userId, @RequestParam("wcId") int wcId) {

        Optional<Users> user = favoriteService.getUserById(userId);
        Optional<WcInfo> wcInfo = favoriteService.getWcInfoById(wcId);

        Favorite favorite = favoriteService.addFavorite(user.orElse(null), wcInfo.orElse(null));

        return favorite;
    }

    @ResponseBody
    @GetMapping("/isFavorites")
    public boolean isFavorites(@RequestParam("userId") String userId, @RequestParam("wcId") int wcId) {
        Optional<Users> user = favoriteService.getUserById(userId);
        Optional<WcInfo> wcInfo = favoriteService.getWcInfoById(wcId);

        if (user.isPresent() && wcInfo.isPresent()) {
            var isUser = user.get();
            var isWcInfo = wcInfo.get();
            return favoriteService.isFavorite(isUser, isWcInfo);
        } else {
            return false;
        }
    }

    @ResponseBody
    @GetMapping("/removeFavorites")
    public boolean removeFavorites(@RequestParam("userId") String userId,@RequestParam("wcId") int wcId) {
        boolean result = false;

        if ((!userId.equals("") && userId != null) && (wcId > 0)) {
            Optional<Users> user = favoriteService.getUserById(userId);
            Optional<WcInfo> wcInfo = favoriteService.getWcInfoById(wcId);

            if (user.isPresent() && wcInfo.isPresent()) {
                var isUser = user.get();
                var isWcInfo = wcInfo.get();

                result =  favoriteService.removeFavorite(isUser, isWcInfo);
            }
        }

        return result;
    }
}
