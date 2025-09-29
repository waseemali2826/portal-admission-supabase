export type SimpleEnquiry = {
  id: string;
  name: string;
  contact: string;
  course: string;
  status: "Pending" | "Enrolled" | "Not Interested";
  createdAt: string;
};

export const recentEnquiriesSample: SimpleEnquiry[] = [
  {
    id: "ENQ-1001",
    name: "Ali Raza",
    contact: "0301-1234567",
    course: "Full-Stack Web Development",
    status: "Pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ENQ-1002",
    name: "Sara Khan",
    contact: "0302-9876543",
    course: "UI/UX Design",
    status: "Pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ENQ-1003",
    name: "Hamza Ahmed",
    contact: "0303-5557788",
    course: "Python Programming",
    status: "Enrolled",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ENQ-1004",
    name: "Mina Tariq",
    contact: "0304-2233445",
    course: "Digital Marketing",
    status: "Pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ENQ-1005",
    name: "Usman Javed",
    contact: "0305-6677889",
    course: "Data Science",
    status: "Not Interested",
    createdAt: new Date().toISOString(),
  },
];
