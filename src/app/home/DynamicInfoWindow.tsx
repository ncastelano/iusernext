import { OverlayView } from "@react-google-maps/api";
import CustomInfoWindowUser from "./CustomInfoWindowUser";
import CustomInfoWindowFlash from "./CustomInfoWindowFlash";
import CustomInfoWindowStore from "./CustomInfoWindowStore";
import CustomInfoWindowProduct from "./CustomInfoWindowProduct";
import CustomInfoWindowPlace from "./CustomInfoWindowPlace";
import { MarkerData, VideoData } from "types/markerTypes";

type Props = {
  selectedUserMarker: MarkerData | null;
  selectedFlashMarker: VideoData | null;
  selectedStoreMarker: VideoData | null;
  selectedProductMarker: VideoData | null;
  selectedPlaceMarker: VideoData | null;
  clearMarker: (type: string) => void;
};

export default function DynamicInfoWindows({
  selectedUserMarker,
  selectedFlashMarker,
  selectedStoreMarker,
  selectedProductMarker,
  selectedPlaceMarker,
  clearMarker,
}: Props) {
  const views: {
    marker: MarkerData | VideoData | null;
    component: React.ReactNode;

    key: string;
    lat: number;
    lng: number;
  }[] = [];

  if (selectedUserMarker) {
    views.push({
      marker: selectedUserMarker,
      component: (
        <CustomInfoWindowUser
          user={selectedUserMarker}
          onClose={() => clearMarker("user")}
        />
      ),
      key: "user",
      lat: selectedUserMarker.latitude,
      lng: selectedUserMarker.longitude,
    });
  }

  if (selectedFlashMarker) {
    views.push({
      marker: selectedFlashMarker,
      component: (
        <CustomInfoWindowFlash
          video={selectedFlashMarker}
          onClose={() => clearMarker("flash")}
        />
      ),
      key: "flash",
      lat: selectedFlashMarker.latitude,
      lng: selectedFlashMarker.longitude,
    });
  }

  if (selectedStoreMarker) {
    views.push({
      marker: selectedStoreMarker,
      component: (
        <CustomInfoWindowStore
          video={selectedStoreMarker}
          onClose={() => clearMarker("store")}
        />
      ),
      key: "store",
      lat: selectedStoreMarker.latitude,
      lng: selectedStoreMarker.longitude,
    });
  }

  if (selectedProductMarker) {
    views.push({
      marker: selectedProductMarker,
      component: (
        <CustomInfoWindowProduct
          video={selectedProductMarker}
          onClose={() => clearMarker("product")}
        />
      ),
      key: "product",
      lat: selectedProductMarker.latitude,
      lng: selectedProductMarker.longitude,
    });
  }

  if (selectedPlaceMarker) {
    views.push({
      marker: selectedPlaceMarker,
      component: (
        <CustomInfoWindowPlace
          video={selectedPlaceMarker}
          onClose={() => clearMarker("place")}
        />
      ),
      key: "place",
      lat: selectedPlaceMarker.latitude,
      lng: selectedPlaceMarker.longitude,
    });
  }

  return (
    <>
      {views.map(({ key, lat, lng, component }) => (
        <OverlayView
          key={key}
          position={{ lat, lng }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          {component}
        </OverlayView>
      ))}
    </>
  );
}
