public void CornerCutLayout(layout, cutValues, height, width) {
  {
    let id = layout;
    let cutList = listFromCsvRow(cutValues);
    Invoke(GetComponentByName("ShapeableView1"), "Create", new Object[] {
      id,
      layout,
      GetProperty(GetComponentByName("ShapeableView1"), "CutCorner")
    });
    Invoke(GetComponentByName("ShapeableView1"), "SetCornerCutSize", new Object[] {
      id,
      cutList.get(1),
      cutList.get(2),
      cutList.get(3),
      cutList.get(4)
    });
    Invoke(GetComponentByName("ShapeableView1"), "SetHeight", new Object[] {
      id,
      height
    });
    Invoke(GetComponentByName("ShapeableView1"), "SetWidth", new Object[] {
      id,
      width
    });
  }
}

public void DictTest() {
  {
    let name = CreateDict(new Object[] {
      {
        GetProperty(GetComponentByName("LayoutShadow1"), "ShadowDistance"), global radius
      }, {
        "global name",
        name
      }
    });
    let name2 = "";
    name = DictGet(name, "global name", "not found");
  }
}