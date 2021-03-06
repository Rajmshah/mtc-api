export default {
    /**
     * This function adds one to its input.
     * @param {number} input any number
     * @returns {number} that number, plus one.
     */
    search(data, callback) {
        var skipVal = 0
        var pageLimit = 10
        if (data.page) {
            skipVal = (data.page - 1) * pageLimit
        }
        var filter = {}
        if (data.name) {
            filter = {
                $or: [
                    {
                        name: {
                            $regex: data.name,
                            $options: "i"
                        }
                    },
                    {
                        typeSponsor: {
                            $regex: data.name,
                            $options: "i"
                        }
                    }
                ]
            }
        }
        async.parallel(
            {
                result: function(callback) {
                    Sponsor.find(filter)
                        .skip(skipVal)
                        .limit(pageLimit)
                        .exec(callback)
                },
                count: function(callback) {
                    Sponsor.countDocuments(filter).exec(callback)
                }
            },
            callback
        )
    },
    getList(data, callback) {
        async.parallel(
            {
                sponsorBigList: function(callback) {
                    Sponsor.find({ active: true, typeSponsor: "Big" })
                        .sort({ order: 1 })
                        .exec(callback)
                },
                sponsorMediumList: function(callback) {
                    Sponsor.find({ active: true, typeSponsor: "Medium" })
                        .sort({ order: 1 })
                        .exec(callback)
                },
                sponsorSmallList: function(callback) {
                    Sponsor.find({ active: true, typeSponsor: "Small" })
                        .sort({ order: 1 })
                        .exec(callback)
                }
            },
            callback
        )
        // Sponsor.find({ active: true })
        //     .sort({ typeSponsor: 1 })
        //     .exec(function(err, sponsors) {
        //         if (err) callback(err)
        //         if (_.isEmpty(sponsors)) callback(null, {})
        //         if (sponsors) {
        //             var obj = {}
        //             obj.sponsorBigList = _.filter(sponsors)
        //             obj.sponsorMediumList
        //             obj.sponsorSmallList
        //         }
        //     })
    },
    getAll(data, callback) {
        Sponsor.find({ active: true })
            .sort({ order: 1 })
            .exec(callback)
    },
    getOne(data, callback) {
        Sponsor.findOne({
            _id: data.id
        }).exec(callback)
    },
    createSponsor(data, callback) {
        const sponsor = new Sponsor(data)
        sponsor.save(callback)
    },
    delete(data, callback) {
        var obj = {
            _id: data.id
        }
        Sponsor.deleteOne(obj, callback)
    },
    updateData: (param, data, callback) => {
        var data2 = _.cloneDeep(data)
        if (data2._id) {
            delete data2._id
        }
        Sponsor.updateOne({ _id: param.id }, { $set: data2 }).exec(callback)
    },
    generateExcel: function(name, found, res) {
        var excelData = []
        _.each(found, function(singleData) {
            var singleExcel = {}
            _.each(singleData, function(n, key) {
                if (key != "__v" && key != "createdAt" && key != "updatedAt") {
                    singleExcel[key] = n
                }
            })
            excelData.push(singleExcel)
        })
        var xls = json2xls(excelData)

        var folder = "./.tmp/"
        fse.ensureDir(folder, (err) => {
            var path =
                name + "-" + moment().format("MMM-DD-YYYY-hh-mm-ss-a") + ".xlsx"
            var finalPath = folder + path

            fs.writeFile(finalPath, xls, "binary", function(err) {
                if (err) {
                    res.callback(err, null)
                } else {
                    fs.readFile(finalPath, function(err, excel) {
                        if (err) {
                            res.callback(err, null)
                        } else {
                            res.send(excel)
                            fs.unlink(finalPath)
                        }
                    })
                }
            })
        })
    }
}
