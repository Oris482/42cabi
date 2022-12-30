import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  myCabinetInfoState,
  currentCabinetIdState,
  targetCabinetInfoState,
} from "@/recoil/atoms";
import { CabinetInfo, MyCabinetInfoResponseDto } from "@/types/dto/cabinet.dto";
import CabinetStatus from "@/types/enum/cabinet.status.enum";
import CabinetType from "@/types/enum/cabinet.type.enum";
import styled, { css } from "styled-components";
import { axiosCabinetById } from "@/api/axios/axios.custom";

const CabinetListItemContainer = (props: CabinetInfo): JSX.Element => {
  const MY_INFO = useRecoilValue<MyCabinetInfoResponseDto>(myCabinetInfoState);
  const setCurrentCabinetId = useSetRecoilState<number>(currentCabinetIdState);
  const setTargetCabinetInfo = useSetRecoilState<CabinetInfo>(
    targetCabinetInfoState
  );
  const isMine = MY_INFO ? MY_INFO.cabinet_id === props.cabinet_id : false;

  let cabinetLabelText = "";
  if (props.status !== "BANNED" && props.status !== "BROKEN") {
    //사용불가가 아닌 모든 경우
    if (props.lent_type === "PRIVATE")
      cabinetLabelText = props.lent_info[0]?.intra_id;
    else if (props.lent_type === "SHARE")
      cabinetLabelText = props.lent_info.length + " / " + props.max_user;
    else if (props.lent_type === "CIRCLE")
      cabinetLabelText = props.cabinet_title ? props.cabinet_title : "";
  } else {
    //사용불가인 경우
    cabinetLabelText = "사용불가";
  }
  const selectCabinetOnClick = (cabinetId: number) => {
    setCurrentCabinetId(cabinetId);
    async function getData(cabinetId: number) {
      try {
        const { data } = await axiosCabinetById(cabinetId);
        setTargetCabinetInfo(data);
      } catch (error) {
        console.log(error);
      }
    }
    getData(cabinetId);
  };

  return (
    <CabinetListItemStyled
      status={props.status}
      isMine={isMine}
      onClick={() => {
        selectCabinetOnClick(props.cabinet_id);
      }}
    >
      <CabinetIconNumberWrapperStyled>
        <CabinetIconContainerStyled
          lent_type={props.lent_type}
          isMine={isMine}
          status={props.status}
        />
        <CabinetNumberStyled status={props.status} isMine={isMine}>
          {props.cabinet_num}
        </CabinetNumberStyled>
      </CabinetIconNumberWrapperStyled>
      <CabinetLabelStyled
        className="textNowrap"
        status={props.status}
        isMine={isMine}
      >
        {cabinetLabelText}
      </CabinetLabelStyled>
    </CabinetListItemStyled>
  );
};

const cabinetStatusColorMap = {
  [CabinetStatus.AVAILABLE]: "var(--available)",
  [CabinetStatus.SET_EXPIRE_FULL]: "var(--full)",
  [CabinetStatus.SET_EXPIRE_AVAILABLE]: "var(--available)",
  [CabinetStatus.EXPIRED]: "var(--expired)",
  [CabinetStatus.BROKEN]: "var(--broken)",
  [CabinetStatus.BANNED]: "var(--banned)",
};

const cabinetIconSrcMap = {
  [CabinetType.PRIVATE]: "src/assets/images/privateIcon.svg",
  [CabinetType.SHARE]: "src/assets/images/shareIcon.svg",
  [CabinetType.CIRCLE]: "src/assets/images/circleIcon.svg",
};

const cabinetFilterMap = {
  [CabinetStatus.AVAILABLE]: "brightness(100)",
  [CabinetStatus.SET_EXPIRE_FULL]: "none",
  [CabinetStatus.SET_EXPIRE_AVAILABLE]: "brightness(100)",
  [CabinetStatus.EXPIRED]: "brightness(100)",
  [CabinetStatus.BROKEN]: "brightness(100)",
  [CabinetStatus.BANNED]: "brightness(100)",
};

const cabinetLabelColorMap = {
  [CabinetStatus.AVAILABLE]: "var(--white)",
  [CabinetStatus.SET_EXPIRE_FULL]: "var(--black)",
  [CabinetStatus.SET_EXPIRE_AVAILABLE]: "var(--white)",
  [CabinetStatus.EXPIRED]: "var(--white)",
  [CabinetStatus.BROKEN]: "var(--white)",
  [CabinetStatus.BANNED]: "var(--white)",
};

const CabinetListItemStyled = styled.div<{
  status: CabinetStatus;
  isMine: boolean;
}>`
  position: relative;
  background-color: ${(props) => cabinetStatusColorMap[props.status]};
  ${(props) =>
    props.isMine &&
    css`
      background-color: var(--mine);
    `}
  width: 80px;
  height: 80px;
  margin: 5px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 8px 14px;
  transition: all 0.2s;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

const CabinetIconNumberWrapperStyled = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CabinetLabelStyled = styled.p<{
  status: CabinetStatus;
  isMine: boolean;
}>`
  font-size: 0.875rem;
  line-height: 1.125rem;
  letter-spacing: -0.02rem;
  color: ${(props) => cabinetLabelColorMap[props.status]};
  ${(props) =>
    props.isMine &&
    css`
      color: var(--black);
    `}
`;

const CabinetNumberStyled = styled.p<{
  status: CabinetStatus;
  isMine: boolean;
}>`
  font-size: 0.875rem;
  color: ${(props) => cabinetLabelColorMap[props.status]};
  ${(props) =>
    props.isMine &&
    css`
      color: var(--black);
    `}
`;

const CabinetIconContainerStyled = styled.div<{
  lent_type: CabinetType;
  status: CabinetStatus;
  isMine: boolean;
}>`
  width: 16px;
  height: 16px;
  background-image: url(${(props) => cabinetIconSrcMap[props.lent_type]});
  background-size: contain;
  filter: ${(props) => cabinetFilterMap[props.status]};
  ${(props) =>
    props.isMine &&
    css`
      filter: none;
    `};
`;

export default CabinetListItemContainer;
