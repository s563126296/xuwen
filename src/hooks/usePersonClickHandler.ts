import type { FieldPerson } from '../stores/commandStore';

export function usePersonClickHandler(
  mapInstance: React.MutableRefObject<any>,
  mapRef: React.RefObject<HTMLDivElement>,
  selectedPerson: FieldPerson | null,
  setSelectedPerson: (person: FieldPerson | null) => void,
  setPopupPosition: (pos: { x: number; y: number } | null) => void
) {
  const handlePersonClick = (person: FieldPerson) => {
    if (selectedPerson?.id === person.id) {
      setSelectedPerson(null);
      setPopupPosition(null);
      return;
    }

    setSelectedPerson(person);

    if (mapInstance.current && (window as any).AMap) {
      const AMap = (window as any).AMap;
      const pixel = mapInstance.current.lngLatToContainer(
        new AMap.LngLat(person.position[0], person.position[1])
      );

      const mapContainer = mapRef.current;
      const popupWidth = 200;
      const popupHeight = 140;
      const padding = 20;

      let x = pixel.getX() + 20;
      let y = pixel.getY() - 70;

      if (mapContainer) {
        const mapWidth = mapContainer.clientWidth;
        const mapHeight = mapContainer.clientHeight;

        if (x + popupWidth > mapWidth - padding) {
          x = pixel.getX() - popupWidth - 20;
        }
        if (x < padding) {
          x = padding;
        }
        if (y < padding) {
          y = padding;
        }
        if (y + popupHeight > mapHeight - padding) {
          y = mapHeight - popupHeight - padding;
        }
      }

      setPopupPosition({ x, y });
    }
  };

  return { handlePersonClick };
}
