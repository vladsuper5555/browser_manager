import React from "react";
import { motion } from "framer-motion";

class Timer extends React.Component {
  constructor() {
    super();
    this.state = {
      urls: [],
      groups: {},
    };
    this.references = {};
    this.state.groups = JSON.parse(localStorage.getItem("groups"));
    window.addEventListener("beforeunload", () => {
      localStorage.setItem("groups", JSON.stringify(this.state.groups));
    });
    this.updateInterface();
  }

  updateLinksFromGroups() {
    var oldgroups = this.state.groups;
    var links = this.state.urls;
    var changed = 0;
    Object.keys(oldgroups).map((item, index) => {
      oldgroups[item].map((value) => {
        var index = links.indexOf(value);
        if (index > -1) {
          links.splice(index, 1);
          changed = 1;
        }
      });
    });
    if (changed == 0) return;
    this.setState({
      urls: links,
      groups: oldgroups,
    });
  }

  updateInterface = () => {
    let fetchingURLs = async () => {
      let ans = await fetch("http://localhost:8080/url")
        .then((data) => data.json())
        .catch((error) => {
          return "failed";
        });
      if (ans == "failed") {
        let old_groups = this.state.groups;

        this.setState({
          urls: ["Unsuccesful fetching, trying again"],
          groups: old_groups,
        });
        var id = window.setTimeout(function () { }, 0);

        while (id--) {
          window.clearTimeout(id);
        }
        setTimeout(this.updateInterface, 10000);
        return;
      }
      let old_groups = this.state.groups;

      this.setState({
        urls: ans.URLs.links,
        groups: old_groups,
      });
      this.updateLinksFromGroups();
    };
    fetchingURLs();
  };

  componentDidUpdate() {
    var id = window.setTimeout(function () { }, 0);

    while (id--) {
      window.clearTimeout(id);
    }
    setTimeout(this.updateInterface, 10000);
  }

  changeWindows(url) {
    window.location.href = String(url);
  }

  destroyInputForm() {
    let parent = document.getElementById('activeInputForm').parentNode;
    var var1   = parent.getElementsByTagName('br');

    for(var i = var1.length; i--;) {
        var1[i].parentNode.removeChild(var1[i]);
    }
    document.getElementById("activeInputForm").remove();
    document.getElementById("activeInputButton").remove();
  }

  addDataFromInput(whereToAdd, whereToGet) {
    let data_got = document.getElementById(whereToGet).value;
    let oldUrls = this.state.urls;
    let oldGroups = this.state.groups;
    let ok = 1;
    Object.keys(oldGroups).map((item) => {
      if (String(item) == String(data_got)) {
        ok = 0;
        return;
      }
    });

    if (ok == 0) {
      this.destroyInputForm();
      return;
    }
    if (whereToAdd === "urls") {
      oldUrls.push(data_got);
    } else if (whereToAdd == "newGroup") {
      oldGroups[data_got] = [];
    } else if (whereToAdd["action"] == "newLinkInGroup") {
      oldGroups[whereToAdd["groupName"]].push(data_got);
    }

    this.destroyInputForm();

    this.setState({
      urls: oldUrls,
      groups: oldGroups,
    });
  }

  createFormButton(whereToAddData, whereToGetData) {
    var button = document.createElement("button");
    console.log(whereToAddData);
    if (whereToAddData == "newGroup")
      button.innerHTML = "Create New Group";
    else 
      button.innerHTML = "Create New Link";
    button.style.backgroundColor = "lightblue";
    button.style.border = "1px solid blue";
    button.style.borderRadius = '1229px';
    button.id = "activeInputButton";
    button.onclick = () =>
      this.addDataFromInput(whereToAddData, whereToGetData);
    return button;
  }

  createFormInput() {
    var input = document.createElement("input");
    input.id = "activeInputForm";
    input.value = "GroupName";
    var base = 1;
    let list_of_groups = [];
    Object.keys(this.state.groups).map((name) => {
      list_of_groups.push(name);
    });
    let ok = 0;
    while (ok == 0) {
      if (list_of_groups.indexOf(input.value) > -1) {
        input.value = "GroupName" + base;
        base++;
      } else ok = 1;
    }
    input.style.fontFamily = "Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace";
    input.style.color = "darkblue";
    input.style.margin = "10px 10px 10px 10px"
    return input;
  }

  addInputForm(divId, whereToAddData) {
    if (document.getElementById("activeInputForm") != null) return;

    let inputGroupName = this.createFormInput();
    let buttonSubmit = this.createFormButton(whereToAddData, inputGroupName.id);
    let br = document.createElement('br');
    document.getElementById(divId).appendChild(br);
    document.getElementById(divId).appendChild(inputGroupName);
    document.getElementById(divId).appendChild(buttonSubmit);
  }

  //resive the divs in groups so they correspons to their hitboxex (make the width of the div be the real value not all the column)
  render() {
    return (
      <div>
        <div id="linkuri">
          {this.state.urls.map((item) => {
            return (
              <motion.button
                whileHover={{ scale: 1.1 }}
                style={{ zIndex: 100, position: "relative" }}
                id={item}
                onDoubleClick={(e) => this.changeWindows(e.target.id)}
                initial={false}
                animate={{
                  backgroundColor: "lightblue",
                  border: "1px solid blue",
                  borderRadius: "1233px",
                  margin: "25px 25px 25px 25px",
                }}
                drag={true}
                dragConstraints={{ tox: 0, bottom: 0, right: 0, left: 0 }}
                dragElastic={1}
                onDragEnd={(event, info) => {
                  if (item == "Unsuccesful fetching, retring") return;
                  Object.keys(this.state.groups).map((groupName) => {
                    // to implement the case when the object was not moved
                    var end_x = info.point.x;
                    var end_y = info.point.y;

                    var eltop = parseFloat(
                      this.references[groupName].getClientRects()[0].top
                    );
                    var elleft = parseFloat(
                      this.references[groupName].getClientRects()[0].left
                    );

                    var width = parseFloat(
                      this.references[groupName].getBoundingClientRect().width
                    );
                    var height = parseFloat(
                      this.references[groupName].getBoundingClientRect().height
                    );

                    var overlap = false;
                    if (
                      elleft <= end_x &&
                      end_x <= elleft + width &&
                      eltop <= end_y &&
                      end_y <= eltop + height
                    )
                      overlap = true;

                    if (overlap) {
                      var oldGroups = this.state.groups;
                      var oldUrls = this.state.urls;
                      oldGroups[groupName].push(String(event.target.id));

                      this.setState({
                        urls: oldUrls,
                        groups: oldGroups,
                      });

                      this.updateLinksFromGroups();
                    }
                  });
                }}
              >
                {item}
              </motion.button>
            );
          })}
        </div>

        <div>
          <div id="addNewGroup">
            <motion.button
              initial={false}
              whileHover={{ scale: 1.1 }}
              onClick={(e) => this.addInputForm("addNewGroup", "newGroup")}
              animate={{
                backgroundColor: "lightblue",
                border: "1px solid blue",
                borderRadius: "1233px",
                margin: "25px 25px 25px 50px",
              }}
            >
              Create new group
            </motion.button>
          </div>  
          {Object.keys(this.state.groups).map((groupName, index) => {
            return (
              <motion.div
                style={{textAlign: 'center',  float: 'left', width: 'max-content', zIndex: 15, position: "relative", margin: "2px 15px 10px 60px"}}
                dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                id={groupName}
                ref={(div) => {
                  this.references[groupName] = div;
                }}
              >
                <motion.button
                  style = {{fontSize: 10, backgroundColor: "#ff7a7a", color: '#420000', border: '1px solid red', borderRadius: '1999px'}}
                  onClick={() => {
                    let oldgroups = this.state.groups;
                    let oldurls = this.state.urls;
                    delete oldgroups[groupName];

                    this.setState({
                      urls: oldurls,
                      groups: oldgroups,
                    });
                  }}
                >
                  X
                </motion.button>
                <motion.label
                  whileHover={{ scale: 1.1 }}
                  style = {{fontFamily: "Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace", backgroundColor: "#fff18a", border: "2px solid #f5d800", borderRadius: "1999px", fontSize: 20, margin: "0px 5px 0px 5px"}}
                  className={groupName}
                  onDoubleClick={(e) => {
                    let place = document.getElementsByClassName(groupName)[0]; // getting the label </motion.div>
                    let newinput = document.createElement("input");
                    let oldlabel =
                      document.getElementsByClassName(groupName)[0];

                    let parent = place.parentNode;
                    newinput.value = groupName;
                    newinput.className = groupName;
                    newinput.addEventListener("keydown", (event) => {
                      if (event.keyCode == 13) {
                        let groups = this.state.groups;
                        let links = this.state.urls;
                        let oldgroupname = oldlabel.className;
                        let newgroupname = event.target.value;
                        let actual =
                          document.getElementsByClassName(oldgroupname)[0];
                        oldlabel.className = newgroupname;
                        oldlabel.innerHTML = newgroupname;
                        let parent = actual.parentNode;
                        parent.replaceChild(oldlabel, actual);
                        let oldvaluesfromgroup = groups[oldgroupname];
                        groups[newgroupname] = oldvaluesfromgroup;
                        delete groups[oldgroupname];
                        let oldref = this.references[oldgroupname];
                        delete this.references[oldgroupname];
                        this.references[newgroupname] = oldref;

                        this.setState({
                          urls: links,
                          groups: groups,
                        });
                        Object.keys(groups).map((name) => {
                          let lb =
                            document.getElementsByClassName(name)[0].parentNode
                              .id;
                          document.getElementsByClassName(name)[0].innerHTML =
                            lb;
                        });
                        this.forceUpdate();
                      }
                    });
                    // till here we create the input
                    parent.replaceChild(newinput, place);
                  }}
                >
                  {groupName}
                </motion.label>

                <motion.button
                  initial={false}
                  
                  style = {{fontSize: 13, color: '#213f22', backgroundColor: "lightgreen", borderRadius: '1999px', border: "1px solid green"}}
                  onClick={(e) =>
                    this.addInputForm(groupName, {
                      action: "newLinkInGroup",
                      groupName: groupName,
                    })
                  }
                >
                  +{" "}
                </motion.button>
                {this.state.groups[groupName].map((link) => {
                  return (
                    <div style = {{marginTop: "10px", textAlign: 'left'}}>
                      <motion.button
                        style = {{fontSize: 10, backgroundColor: "#ff7a7a", color: '#420000', border: '1px solid red', borderRadius: '1999px', marginRight: "5px"}}
                        onClick={() => {
                          let oldgroups = this.state.groups;
                          let oldurls = this.state.urls;
                          let index = oldgroups[groupName].indexOf(link);
                          oldgroups[groupName].splice(index, 1);

                          this.setState({
                            urls: oldurls,
                            groups: oldgroups,
                          });
                        }}
                      >
                        {" "}
                        X{" "}
                      </motion.button>
                      <motion.button
                        style = {{background: "none", border: "none", color: "darkblue"}}
                        whileHover={{ scale: 1.1 }}
                        drag
                        dragConstraints={{
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                        }}
                        dragElastic={1}
                        id={link}
                        onDragStart={(event, info) => {
                          document.getElementById(groupName).style.zIndex = 60;
                        }}
                        onDragEnd={(event, info) => {
                          Object.keys(this.state.groups).map((groupNameFor) => {
                            // to implement the case when the object was not moved
                            var end_x = info.point.x;
                            var end_y = info.point.y;

                            var eltop = parseFloat(
                              this.references[groupNameFor].getClientRects()[0]
                                .top
                            );
                            var elleft = parseFloat(
                              this.references[groupNameFor].getClientRects()[0]
                                .left
                            );

                            var width = parseFloat(
                              this.references[
                                groupNameFor
                              ].getBoundingClientRect().width
                            );
                            var height = parseFloat(
                              this.references[
                                groupNameFor
                              ].getBoundingClientRect().height
                            );

                            var overlap = false;
                            if (
                              elleft <= end_x &&
                              end_x <= elleft + width &&
                              eltop <= end_y &&
                              end_y <= eltop + height
                            )
                              overlap = true;

                            if (overlap) {
                              var oldGroups = this.state.groups;
                              var oldUrls = this.state.urls;
                              oldGroups[groupNameFor].push(
                                String(event.target.id)
                              );
                              let index = oldGroups[groupName].indexOf(
                                event.target.id
                              );
                              oldGroups[groupName].splice(index, 1);

                              this.setState({
                                urls: oldUrls,
                                groups: oldGroups,
                              });
                              document.getElementById(
                                groupName
                              ).style.zIndex = 15;
                              this.updateLinksFromGroups();
                            }
                          });
                        }}
                        onDoubleClick={(e) => this.changeWindows(e.target.id)}
                      >
                        {link}{" "}
                      </motion.button>
                    </div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>
      </div >
    );
  }
}

export default Timer;
