import agent1 from "../assets/images/agent-1.png";

export interface Agent {
  id: string;
  name: string;
  role: string;
  phone: string;
  image: string;
}

export const agents: Agent[] = [
  {
    id: "1",
    name: "Isabella Mendes",
    role: "Luxury Real Estate Advisor",
    phone: "+55 11 99999-9999",
    image: agent1
  }
];
