import styled from "styled-components";
import TopNavButton from "@/components/TopNav/TopNavButtonGroup/TopNavButton/TopNavButton";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentCabinetIdState,
  targetCabinetInfoState,
  userState,
} from "@/recoil/atoms";
import useMenu from "@/hooks/useMenu";
import { axiosCabinetById } from "@/api/axios/axios.custom";
import { CabinetInfo } from "@/types/dto/cabinet.dto";
import instance from "@/api/axios/axios.instance";
import { useNavigate } from "react-router-dom";

const TopNavButtonGroup = ({ isAdmin }: { isAdmin?: boolean }) => {
  const { toggleCabinet, toggleMap, openCabinet, closeAll } = useMenu();
  const [currentCabinetId, setCurrentCabinetId] = useRecoilState(
    currentCabinetIdState
  );
  const setTargetCabinetInfo = useSetRecoilState<CabinetInfo>(
    targetCabinetInfoState
  );
  const myInfo = useRecoilValue(userState);

  async function setTargetCabinetInfoToMyCabinet() {
    setCurrentCabinetId(myInfo.cabinet_id);
    try {
      const { data } = await axiosCabinetById(myInfo.cabinet_id);
      setTargetCabinetInfo(data);
    } catch (error) {
      console.log(error);
    }
  }

  const clickMyCabinet = () => {
    if (myInfo.cabinet_id === -1) return;
    if (currentCabinetId !== myInfo.cabinet_id) {
      setTargetCabinetInfoToMyCabinet();
      openCabinet();
    } else {
      toggleCabinet();
    }
  };

  const axiosRemovePenaltyURL = "/api/betatest/deletebanlog";
  const axiosRemovePenalty = async (): Promise<any> => {
    try {
      const response = await instance.delete(axiosRemovePenaltyURL);
      console.log(response);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const navigator = useNavigate();
  const clickSearchButton = () => {
    closeAll();
    navigator("search");
  };

  return (
    <NaviButtonsStyled>
      {import.meta.env.VITE_UNBAN === "true" && (
        <TopNavButton
          onClick={axiosRemovePenalty}
          imgSrc="/src/assets/images/happyCcabiWhite.png"
          width="32px"
          height="32px"
        />
      )}
      {isAdmin && (
        <TopNavButton
          id="searchButton"
          onClick={clickSearchButton}
          imgSrc="/src/assets/images/searchWhite.svg"
          width="28px"
          height="28px"
          disable={true}
        />
      )}
      <TopNavButton
        disable={myInfo.cabinet_id === -1}
        onClick={clickMyCabinet}
        imgSrc="/src/assets/images/myCabinetIcon.svg"
      />
      <TopNavButton onClick={toggleMap} imgSrc="/src/assets/images/map.svg" />
    </NaviButtonsStyled>
  );
};
const NaviButtonsStyled = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > div:last-child {
    margin-right: 0;
  }
`;

export default TopNavButtonGroup;
